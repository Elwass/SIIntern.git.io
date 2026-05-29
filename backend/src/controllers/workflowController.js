import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { documentStatuses } from '../constants/applicationConstants.js'
import * as workflow from '../repositories/workflowRepository.js'
import * as applications from '../repositories/applicationRepository.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadRoot = join(__dirname, '..', 'uploads')
const logbookStatuses = ['pending', 'approved', 'rejected']
const attendanceStatuses = ['present', 'late', 'sick', 'permit', 'absent']
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function httpError(statusCode, message) { const error = new Error(message); error.statusCode = statusCode; return error }
function id(value, label = 'ID') { const n = Number(value); if (!Number.isInteger(n) || n < 1) throw httpError(400, `${label} tidak valid.`); return n }
function today() { return new Date().toISOString().slice(0, 10) }
function nowMysql() { return new Date().toISOString().slice(0, 19).replace('T', ' ') }
function isDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) }
function isAdmin(req) { return ['admin', 'pembimbing_lapangan'].includes(req.user?.role) }
function isMentor(req) { return ['mentor', 'pembimbing_lapangan'].includes(req.user?.role) }
function requireAdmin(req) { if (!isAdmin(req)) throw httpError(403, 'Akses admin diperlukan.') }
function requireMentor(req) { if (!isMentor(req)) throw httpError(403, 'Akses mentor diperlukan.') }
function requireStudent(req) { if (req.user?.role !== 'student') throw httpError(403, 'Akses mahasiswa diperlukan.') }

async function saveOptionalFile(applicationId, prefix, file = {}) {
  const fileName = String(file.fileName || '').trim()
  const base64 = String(file.base64 || '')
  if (!fileName) return { fileName: '', filePath: '', fileUrl: '' }
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
  const stored = `${prefix}-${Date.now()}-${safe}`
  const rel = `/uploads/application-${applicationId}/${stored}`
  const abs = join(uploadRoot, `application-${applicationId}`, stored)
  await mkdir(dirname(abs), { recursive: true })
  await writeFile(abs, base64 ? Buffer.from(base64, 'base64') : Buffer.alloc(0))
  return { fileName, filePath: rel, fileUrl: rel }
}

async function getApplicationForStudent(req, applicationId) {
  const app = await workflow.getApplicationAccess(applicationId)
  if (!app || Number(app.user_id) !== Number(req.user.id)) throw httpError(404, 'Pendaftaran magang tidak ditemukan.')
  return app
}

async function getApplicationForMentor(req, applicationId) {
  const app = await workflow.getApplicationAccess(applicationId)
  if (!app) throw httpError(404, 'Pendaftaran magang tidak ditemukan.')
  if (req.user.role === 'mentor' && Number(app.mentor_id) !== Number(req.user.id)) throw httpError(403, 'Mentor tidak memiliki akses ke mahasiswa ini.')
  return app
}

async function notifyApplicationUsers(app, title, message, relatedType, relatedId, excludeUserId = null) {
  const targets = [Number(app.user_id), app.mentor_id ? Number(app.mentor_id) : null].filter(Boolean).filter((userId) => userId !== excludeUserId)
  await Promise.all(targets.map((userId) => workflow.createNotification(userId, title, message, relatedType, relatedId)))
}

export async function listMyNotifications(req, res) { res.json({ data: await workflow.listNotifications(req.user.id) }) }
export async function markMyNotificationRead(req, res) { await workflow.markNotificationRead(req.user.id, id(req.params.id)); res.json({ message: 'Notifikasi ditandai sudah dibaca.' }) }

export async function createStudentLogbook(req, res) {
  requireStudent(req)
  const applicationId = id(req.params.applicationId || req.params.id, 'ID pendaftaran')
  const app = await getApplicationForStudent(req, applicationId)
  if (app.status !== 'accepted') throw httpError(400, 'Logbook dapat diisi setelah pendaftaran diterima.')
  const activityDate = String(req.body.activityDate || req.body.activity_date || today())
  const title = String(req.body.title || '').trim()
  const description = String(req.body.description || '').trim()
  if (!isDate(activityDate) || !title || !description) throw httpError(400, 'Tanggal, judul, dan deskripsi logbook wajib valid.')
  const file = await saveOptionalFile(applicationId, 'logbook', req.body.file || req.body.supportingFile || {})
  const { before, entry } = await workflow.upsertLogbook({ id: req.params.logbookId ? id(req.params.logbookId, 'ID logbook') : null, applicationId, userId: req.user.id, mentorId: app.mentor_id, activityDate, title, description, output: String(req.body.output || '').trim(), supportingFileName: file.fileName, supportingFilePath: file.filePath, supportingFileUrl: file.fileUrl })
  await workflow.createAuditLog({ actorId: req.user.id, action: before ? 'logbook.updated' : 'logbook.created', entityType: 'logbook', entityId: entry.id, applicationId, before, after: entry })
  await notifyApplicationUsers(app, 'Logbook menunggu verifikasi', `${app.nama_lengkap || 'Mahasiswa'} mengirim logbook ${activityDate}.`, 'logbook', entry.id, req.user.id)
  res.status(before ? 200 : 201).json({ data: entry })
}

export async function listStudentLogbooks(req, res) {
  requireStudent(req)
  const applicationId = id(req.params.applicationId || req.params.id, 'ID pendaftaran')
  await getApplicationForStudent(req, applicationId)
  res.json({ data: await workflow.listLogbooks({ applicationId, userId: req.user.id, status: req.query.status || '' }) })
}

export async function deleteStudentLogbook(req, res) {
  requireStudent(req)
  const applicationId = id(req.params.applicationId || req.params.id, 'ID pendaftaran')
  await getApplicationForStudent(req, applicationId)
  const before = await workflow.deleteLogbook(applicationId, id(req.params.logbookId, 'ID logbook'))
  if (!before || before.userId !== req.user.id) throw httpError(404, 'Logbook tidak ditemukan.')
  await workflow.createAuditLog({ actorId: req.user.id, action: 'logbook.deleted', entityType: 'logbook', entityId: before.id, applicationId, before })
  res.status(204).send()
}

export async function listMentorLogbooks(req, res) {
  requireMentor(req)
  const applicationId = req.params.applicationId ? id(req.params.applicationId, 'ID pendaftaran') : null
  if (applicationId) await getApplicationForMentor(req, applicationId)
  res.json({ data: await workflow.listLogbooks({ applicationId, mentorId: req.user.role === 'mentor' ? req.user.id : null, status: req.query.status || '' }) })
}

export async function reviewMentorLogbook(req, res) {
  requireMentor(req)
  const applicationId = id(req.params.applicationId, 'ID pendaftaran')
  const app = await getApplicationForMentor(req, applicationId)
  const status = String(req.body.status || '').trim()
  if (!logbookStatuses.includes(status) || status === 'pending') throw httpError(400, 'Status logbook harus approved atau rejected.')
  const { before, entry } = await workflow.reviewLogbook(applicationId, id(req.params.logbookId, 'ID logbook'), { status, feedback: String(req.body.feedback || '').trim(), reviewerId: req.user.id })
  if (!entry) throw httpError(404, 'Logbook tidak ditemukan.')
  await workflow.createAuditLog({ actorId: req.user.id, action: 'logbook.reviewed', entityType: 'logbook', entityId: entry.id, applicationId, before, after: entry })
  await workflow.createNotification(app.user_id, 'Status logbook diperbarui', `Logbook ${entry.activityDate} menjadi ${entry.status}.`, 'logbook', entry.id)
  res.json({ data: entry })
}

export async function checkInStudentAttendance(req, res) { return studentAttendance(req, res, 'checkin') }
export async function checkOutStudentAttendance(req, res) { return studentAttendance(req, res, 'checkout') }
async function studentAttendance(req, res, mode) {
  requireStudent(req)
  const applicationId = id(req.params.applicationId || req.params.id, 'ID pendaftaran')
  const app = await getApplicationForStudent(req, applicationId)
  if (app.status !== 'accepted') throw httpError(400, 'Absensi dapat dilakukan setelah pendaftaran diterima.')
  const attendanceDate = String(req.body.attendanceDate || req.body.attendance_date || today())
  if (!isDate(attendanceDate)) throw httpError(400, 'Tanggal absensi tidak valid.')
  const file = await saveOptionalFile(applicationId, 'attendance', req.body.proof || req.body.file || {})
  const payload = { applicationId, userId: req.user.id, mentorId: app.mentor_id, attendanceDate, status: String(req.body.status || 'present'), proofType: String(req.body.proofType || '').trim(), proofFileName: file.fileName, proofFilePath: file.filePath, proofFileUrl: file.fileUrl, notes: String(req.body.notes || '').trim(), createdBy: req.user.id }
  if (!attendanceStatuses.includes(payload.status)) throw httpError(400, 'Status absensi tidak valid.')
  if (mode === 'checkin') payload.checkInAt = nowMysql(); else payload.checkOutAt = nowMysql()
  const { before, attendance } = await workflow.upsertAttendance(payload)
  await workflow.createAuditLog({ actorId: req.user.id, action: `attendance.${mode}`, entityType: 'attendance', entityId: attendance.id, applicationId, before, after: attendance })
  await notifyApplicationUsers(app, 'Absensi diperbarui', `${app.nama_lengkap || 'Mahasiswa'} melakukan ${mode === 'checkin' ? 'check-in' : 'check-out'} pada ${attendanceDate}.`, 'attendance', attendance.id, req.user.id)
  res.json({ data: attendance })
}

export async function listAttendance(req, res) {
  const query = { applicationId: req.params.applicationId ? id(req.params.applicationId, 'ID pendaftaran') : null, from: req.query.from || '', to: req.query.to || '', status: req.query.status || '' }
  if (req.user.role === 'student') query.userId = req.user.id
  else if (req.user.role === 'mentor') query.mentorId = req.user.id
  else if (!isAdmin(req)) throw httpError(403, 'Akses ditolak.')
  res.json({ data: await workflow.listAttendance(query) })
}

export async function upsertStaffAttendance(req, res) {
  if (!isAdmin(req) && !isMentor(req)) throw httpError(403, 'Akses ditolak.')
  const applicationId = id(req.params.applicationId || req.body.applicationId, 'ID pendaftaran')
  const app = isAdmin(req) ? await workflow.getApplicationAccess(applicationId) : await getApplicationForMentor(req, applicationId)
  if (!app) throw httpError(404, 'Pendaftaran magang tidak ditemukan.')
  const attendanceDate = String(req.body.attendanceDate || today())
  const status = String(req.body.status || 'present')
  if (!isDate(attendanceDate) || !attendanceStatuses.includes(status)) throw httpError(400, 'Tanggal atau status absensi tidak valid.')
  const { before, attendance } = await workflow.upsertAttendance({ applicationId, userId: app.user_id, mentorId: app.mentor_id, attendanceDate, checkInAt: req.body.checkInAt || null, checkOutAt: req.body.checkOutAt || null, status, notes: String(req.body.notes || '').trim(), correctedBy: req.user.id, createdBy: req.user.id })
  await workflow.createAuditLog({ actorId: req.user.id, action: isAdmin(req) ? 'attendance.corrected' : 'attendance.mentor_input', entityType: 'attendance', entityId: attendance.id, applicationId, before, after: attendance })
  await workflow.createNotification(app.user_id, 'Absensi diperbarui', `Absensi ${attendanceDate} diperbarui oleh ${isAdmin(req) ? 'admin' : 'mentor'}.`, 'attendance', attendance.id)
  res.json({ data: attendance })
}

export async function upsertMentorEvaluation(req, res) {
  requireMentor(req)
  const applicationId = id(req.params.applicationId, 'ID pendaftaran')
  const app = await getApplicationForMentor(req, applicationId)
  const scores = ['performanceScore', 'softSkillsScore', 'logbookScore'].map((key) => Number(req.body[key]))
  if (scores.some((score) => !Number.isFinite(score) || score < 0 || score > 100)) throw httpError(400, 'Semua nilai harus 0 sampai 100.')
  const finalScore = Math.round(((scores[0] * 0.4) + (scores[1] * 0.3) + (scores[2] * 0.3)) * 100) / 100
  const grade = finalScore >= 85 ? 'A' : finalScore >= 75 ? 'B' : finalScore >= 65 ? 'C' : 'D'
  const evaluation = await workflow.upsertEvaluation({ applicationId, userId: app.user_id, mentorId: req.user.id, performanceScore: scores[0], softSkillsScore: scores[1], logbookScore: scores[2], finalScore, grade, feedback: String(req.body.feedback || '').trim() })
  await workflow.createAuditLog({ actorId: req.user.id, action: 'evaluation.upserted', entityType: 'evaluation', entityId: evaluation.id, applicationId, after: evaluation })
  await workflow.createNotification(app.user_id, 'Penilaian akhir tersedia', `Nilai akhir magang Anda: ${finalScore} (${grade}).`, 'evaluation', evaluation.id)
  res.json({ data: evaluation })
}

export async function getEvaluation(req, res) {
  const applicationId = id(req.params.applicationId, 'ID pendaftaran')
  if (req.user.role === 'student') await getApplicationForStudent(req, applicationId)
  else if (req.user.role === 'mentor') await getApplicationForMentor(req, applicationId)
  else if (!isAdmin(req)) throw httpError(403, 'Akses ditolak.')
  res.json({ data: await workflow.getEvaluation(applicationId) })
}

export async function adminDashboard(req, res) { requireAdmin(req); res.json({ data: await workflow.dashboardSummary() }) }

export async function adminSendNotification(req, res) {
  requireAdmin(req)
  const userId = id(req.body.userId, 'ID user')
  const title = String(req.body.title || '').trim()
  const message = String(req.body.message || '').trim()
  if (!title || !message) throw httpError(400, 'Judul dan pesan notifikasi wajib diisi.')
  await workflow.createNotification(userId, title, message, req.body.relatedType || null, req.body.relatedId || null)
  await workflow.createAuditLog({ actorId: req.user.id, action: 'notification.sent', entityType: 'notification', entityId: userId, after: { title, message } })
  res.status(201).json({ message: 'Notifikasi berhasil dikirim.' })
}

export async function mentorReviewDocument(req, res) {
  requireMentor(req)
  const applicationId = id(req.params.applicationId, 'ID pendaftaran')
  const app = await getApplicationForMentor(req, applicationId)
  const documentId = id(req.params.documentId, 'ID dokumen')
  const status = String(req.body.status || '').trim()
  if (!documentStatuses.includes(status)) throw httpError(400, 'Status dokumen tidak valid.')
  const document = await applications.updateDocumentStatus(applicationId, documentId, status, String(req.body.notes || req.body.catatanAdmin || '').trim())
  if (!document) throw httpError(404, 'Dokumen tidak ditemukan.')
  await workflow.createAuditLog({ actorId: req.user.id, action: 'document.mentor_reviewed', entityType: 'document', entityId: document.id, applicationId, after: document })
  await workflow.createNotification(app.user_id, 'Dokumen ditinjau mentor', `Dokumen ${document.jenisDokumen} menjadi ${document.status}.`, 'document', document.id)
  res.json({ data: document })
}

export async function exportReport(req, res) {
  const type = String(req.params.type || req.query.type || 'attendance')
  const format = String(req.query.format || 'json')
  let rows = []
  if (type === 'attendance') rows = await workflow.listAttendance({ applicationId: req.query.applicationId || null, userId: req.user.role === 'student' ? req.user.id : null, mentorId: req.user.role === 'mentor' ? req.user.id : null, from: req.query.from || '', to: req.query.to || '' })
  else if (type === 'logbook') rows = await workflow.listLogbooks({ applicationId: req.query.applicationId || null, userId: req.user.role === 'student' ? req.user.id : null, mentorId: req.user.role === 'mentor' ? req.user.id : null })
  else if (type === 'documents') rows = req.query.applicationId ? await applications.listDocuments(req.query.applicationId) : []
  else throw httpError(400, 'Jenis laporan tidak valid.')
  if (format === 'csv' || format === 'excel' || format === 'pdf') {
    const keys = Object.keys(rows[0] || { empty: '' })
    const csv = [keys.join(','), ...rows.map((row) => keys.map((key) => JSON.stringify(row[key] ?? '')).join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`)
    return res.send(csv)
  }
  res.json({ data: rows })
}
