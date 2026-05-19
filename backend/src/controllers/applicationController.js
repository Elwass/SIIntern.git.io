import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applicationStatuses, documentStatuses, internshipFields, requiredDocumentTypes } from '../constants/applicationConstants.js'
import * as defaultApplications from '../repositories/applicationRepository.js'
import * as defaultUsers from '../repositories/userRepository.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadRoot = join(__dirname, '..', 'uploads')
const editableStatuses = ['draft']
const allowedAdminTransitions = {
  draft: ['pending'],
  pending: ['verified', 'rejected'],
  verified: ['accepted', 'rejected'],
}
const statusAliases = { submitted: 'pending', needs_revision: 'rejected', approved: 'accepted' }
const requiredProfileFields = ['namaLengkap', 'nim', 'kampus', 'programStudi', 'semester', 'noHp', 'alamat']
const requiredApplicationFields = ['bidangMagang', 'periodeMulai', 'periodeSelesai', 'motivasi']

let applications = defaultApplications
let users = defaultUsers

export function setApplicationRepositoriesForTests(repositories = {}) {
  applications = repositories.applications || defaultApplications
  users = repositories.users || defaultUsers
}

function createHttpError(statusCode, message, details, outputKey = 'message') {
  const error = new Error(message)
  error.statusCode = statusCode
  error.outputKey = outputKey
  if (details) error.details = details
  return error
}

function requireRoles(req, roles = []) {
  if (!roles.includes(req.user?.role)) {
    throw createHttpError(403, 'Akses ditolak untuk peran pengguna ini.')
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function pickPayload(body = {}) {
  return {
    namaLengkap: body.namaLengkap?.trim() || '',
    nim: body.nim?.trim() || '',
    kampus: body.kampus?.trim() || '',
    programStudi: body.programStudi?.trim() || '',
    semester: Number(body.semester || 0),
    noHp: body.noHp?.trim() || '',
    alamat: body.alamat?.trim() || '',
    bidangMagang: body.bidangMagang?.trim() || '',
    periodeMulai: body.periodeMulai?.trim() || '',
    periodeSelesai: body.periodeSelesai?.trim() || '',
    motivasi: body.motivasi?.trim() || '',
  }
}

function validatePayload(payload) {
  const missing = [...requiredProfileFields, ...requiredApplicationFields].filter((field) => !payload[field])
  if (missing.length) return `Field wajib belum diisi: ${missing.join(', ')}.`
  if (!Number.isInteger(payload.semester) || payload.semester < 1 || payload.semester > 14) return 'Semester harus berupa angka 1 sampai 14.'
  if (!internshipFields.includes(payload.bidangMagang)) return 'Bidang magang tidak valid.'
  if (payload.periodeSelesai < payload.periodeMulai) return 'Periode selesai tidak boleh sebelum periode mulai.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.periodeMulai) || !/^\d{4}-\d{2}-\d{2}$/.test(payload.periodeSelesai)) return 'Format periode harus YYYY-MM-DD.'
  return ''
}

function documentSummary(documents = []) {
  const uploaded = new Set(documents.map((document) => document.jenisDokumen))
  const missing = requiredDocumentTypes.filter((type) => !uploaded.has(type))
  return {
    required: requiredDocumentTypes,
    uploadedCount: documents.length,
    requiredCount: requiredDocumentTypes.length,
    missing,
    complete: missing.length === 0,
  }
}

function composeCurrent(profile, application, documents) {
  return { profile, application, documents, documentSummary: documentSummary(documents) }
}

async function composeDetail(application) {
  if (!application) return null
  const detail = await applications.getApplicationDetail(application.id)
  return { ...detail, application: { ...detail.application, documentSummary: documentSummary(detail.documents) } }
}

// FIX: this now throws instead of returning a response object.
// Returning a response object previously made checks truthy and could continue execution,
// causing double responses (ERR_HTTP_HEADERS_SENT).
function assertEditableOrThrow(application) {
  if (!editableStatuses.includes(application.status)) {
    throw createHttpError(400, 'Pendaftaran hanya dapat diubah saat status pendaftaran masih Diajukan.', null, 'error')
  }
}

async function getStudentOwnedApplicationOrThrow(req) {
  const application = await applications.getApplicationById(req.params.id)
  if (!application || application.userId !== req.user.id) {
    throw createHttpError(404, 'Pendaftaran magang tidak ditemukan.')
  }
  return application
}

async function saveUploadedFile(applicationId, jenisDokumen, fileName, base64 = '') {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
  const relativePath = `/uploads/application-${applicationId}/${jenisDokumen}-${Date.now()}-${safeFileName}`
  const absolutePath = join(uploadRoot, `application-${applicationId}`, `${jenisDokumen}-${Date.now()}-${safeFileName}`)
  await mkdir(dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, base64 ? Buffer.from(base64, 'base64') : Buffer.alloc(0))
  return relativePath
}

export const getApplicationOptions = async (req, res, next) => {
  try {
    return res.json({ internshipFields, requiredDocumentTypes, applicationStatuses, documentStatuses })
  } catch (error) {
    return next(error)
  }
}

export const getCurrentStudentApplication = async (req, res, next) => {
  try {
    requireRoles(req, ['student'])
    const [profile, application] = await Promise.all([
      applications.getStudentProfile(req.user.id),
      applications.getCurrentApplication(req.user.id),
    ])
    const documents = application ? await applications.listDocuments(application.id) : []
    return res.json(composeCurrent(profile, application ? { ...application, documentSummary: documentSummary(documents) } : null, documents))
  } catch (error) {
    return next(error)
  }
}

export const createStudentApplication = async (req, res, next) => {
  try {
    requireRoles(req, ['student'])
    const current = await applications.getCurrentApplication(req.user.id)
    if (current && current.status !== 'rejected') throw createHttpError(409, 'Anda sudah memiliki pendaftaran aktif.')

    const payload = pickPayload(req.body)
    const validation = validatePayload(payload)
    if (validation) throw createHttpError(400, validation)
    if (!validateEmail(req.body.email || req.user.email)) throw createHttpError(400, 'Format email tidak valid.')

    const duplicate = await applications.findApplicationByUserAndPeriod(req.user.id, payload.periodeMulai, payload.periodeSelesai)
    if (duplicate) throw createHttpError(400, 'Anda sudah pernah mendaftar pada periode magang yang sama.')

    const profile = await applications.upsertStudentProfile(req.user.id, payload)
    const application = await applications.createApplication(req.user.id, payload)
    return res.status(201).json(composeCurrent(profile, application, []))
  } catch (error) {
    return next(error)
  }
}

export const updateStudentApplication = async (req, res, next) => {
  try {
    requireRoles(req, ['student'])
    const application = await getStudentOwnedApplicationOrThrow(req)
    assertEditableOrThrow(application)

    const payload = pickPayload(req.body)
    const validation = validatePayload(payload)
    if (validation) throw createHttpError(400, validation)

    const duplicate = await applications.findApplicationByUserAndPeriod(req.user.id, payload.periodeMulai, payload.periodeSelesai)
    if (duplicate && duplicate.id !== application.id) {
      throw createHttpError(400, 'Periode magang ini sudah digunakan pada pendaftaran lain.')
    }

    await applications.upsertStudentProfile(req.user.id, payload)
    const updated = await applications.updateApplication(application.id, payload)
    const [profile, documents] = await Promise.all([
      applications.getStudentProfile(req.user.id),
      applications.listDocuments(application.id),
    ])

    return res.json({ message: 'Pendaftaran berhasil diubah.', ...composeCurrent(profile, { ...updated, documentSummary: documentSummary(documents) }, documents) })
  } catch (error) {
    return next(error)
  }
}

export const createStudentApplicationDocument = async (req, res, next) => {
  try {
    requireRoles(req, ['student'])
    const application = await getStudentOwnedApplicationOrThrow(req)
    assertEditableOrThrow(application)

    const jenisDokumen = req.body.jenisDokumen
    const fileName = req.body.fileName?.trim()
    const mimeType = req.body.mimeType || ''
    const fileSize = Number(req.body.fileSize || 0)

    if (!requiredDocumentTypes.includes(jenisDokumen)) throw createHttpError(400, 'Jenis dokumen tidak valid.')
    if (!fileName) throw createHttpError(400, 'Nama file dokumen wajib diisi.')
    if (fileSize > 5 * 1024 * 1024) throw createHttpError(400, 'Ukuran file maksimal 5MB.')
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(mimeType)) throw createHttpError(400, 'Tipe file harus PDF, JPG, atau PNG.')

    const fileUrl = await saveUploadedFile(application.id, jenisDokumen, fileName, req.body.fileContentBase64 || '')
    const document = await applications.upsertDocument({
      applicationId: application.id,
      userId: req.user.id,
      jenisDokumen,
      fileName,
      filePath: fileUrl,
      fileUrl,
      mimeType,
      fileSize,
    })
    return res.status(201).json(document)
  } catch (error) {
    return next(error)
  }
}

export const getStudentApplicationDocuments = async (req, res, next) => {
  try {
    requireRoles(req, ['student'])
    const application = await getStudentOwnedApplicationOrThrow(req)
    return res.json(await applications.listDocuments(application.id))
  } catch (error) {
    return next(error)
  }
}

export const deleteStudentApplicationDocument = async (req, res, next) => {
  try {
    requireRoles(req, ['student'])
    const application = await getStudentOwnedApplicationOrThrow(req)
    assertEditableOrThrow(application)

    const deleted = await applications.deleteDocument(application.id, req.params.documentId)
    if (!deleted) throw createHttpError(404, 'Dokumen tidak ditemukan.')
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}

export const submitStudentApplication = async (req, res, next) => {
  try {
    requireRoles(req, ['student'])
    const application = await getStudentOwnedApplicationOrThrow(req)
    assertEditableOrThrow(application)

    const profile = await applications.getStudentProfile(req.user.id)
    if (!profile) throw createHttpError(400, 'Data mahasiswa belum lengkap.')

    const documents = await applications.listDocuments(application.id)
    const missing = documentSummary(documents).missing
    if (missing.length) throw createHttpError(400, `Dokumen wajib belum lengkap: ${missing.join(', ')}.`)

    const updated = await applications.setApplicationStatus(application.id, 'pending', application.catatanAdmin || '')
    return res.json(composeCurrent(profile, { ...updated, documentSummary: documentSummary(documents) }, documents))
  } catch (error) {
    return next(error)
  }
}

export const listAdminApplications = async (req, res, next) => {
  try {
    requireRoles(req, ['admin', 'pembimbing_lapangan'])
    const requestedStatus = statusAliases[req.query.status] || req.query.status
    const { data, total } = await applications.listAdminApplications({
      status: requestedStatus,
      bidangMagang: req.query.bidang_magang,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    })
    return res.json({ data, meta: { page: Number(req.query.page || 1), limit: Number(req.query.limit || 10), total } })
  } catch (error) {
    return next(error)
  }
}

export const getAdminApplicationDetail = async (req, res, next) => {
  try {
    requireRoles(req, ['admin', 'pembimbing_lapangan'])
    const detail = await applications.getApplicationDetail(req.params.id)
    if (!detail) throw createHttpError(404, 'Pendaftaran magang tidak ditemukan.')
    return res.json({
      ...detail,
      application: { ...detail.application, documentSummary: documentSummary(detail.documents) },
      mentors: await users.listMentors(),
    })
  } catch (error) {
    return next(error)
  }
}

export const updateAdminApplicationStatus = async (req, res, next) => {
  try {
    requireRoles(req, ['admin', 'pembimbing_lapangan'])
    const application = await applications.getApplicationById(req.params.id)
    if (!application) throw createHttpError(404, 'Pendaftaran magang tidak ditemukan.')

    const nextStatus = statusAliases[req.body.status] || req.body.status
    if (!nextStatus) throw createHttpError(400, 'Status pendaftaran wajib diisi.')
    if (!applicationStatuses.includes(nextStatus)) throw createHttpError(400, 'Status pendaftaran tidak valid.')
    if (!(allowedAdminTransitions[application.status] || []).includes(nextStatus)) {
      throw createHttpError(400, `Status ${application.status} tidak dapat diubah menjadi ${nextStatus}.`)
    }

    const adminNotes = (req.body.adminNotes ?? req.body.admin_notes ?? req.body.catatanAdmin ?? '').trim()
    const updated = await applications.setApplicationStatus(application.id, nextStatus, adminNotes)
    await applications.createNotification(updated.userId, 'Status pendaftaran berubah', `Status pendaftaran magang Anda menjadi ${nextStatus}.`)
    return res.json(await composeDetail(updated))
  } catch (error) {
    return next(error)
  }
}

export const verifyAdminApplication = async (req, res, next) => {
  try {
    req.body.status = 'verified'
    return await updateAdminApplicationStatus(req, res, next)
  } catch (error) {
    return next(error)
  }
}

export const approveAdminApplication = async (req, res, next) => {
  try {
    req.body.status = 'accepted'
    return await updateAdminApplicationStatus(req, res, next)
  } catch (error) {
    return next(error)
  }
}

export const rejectAdminApplication = async (req, res, next) => {
  try {
    req.body.status = 'rejected'
    return await updateAdminApplicationStatus(req, res, next)
  } catch (error) {
    return next(error)
  }
}

export const updateAdminDocumentStatus = async (req, res, next) => {
  try {
    requireRoles(req, ['admin', 'pembimbing_lapangan'])
    if (!['verified', 'needs_revision', 'rejected'].includes(req.body.status)) throw createHttpError(400, 'Status dokumen tidak valid.')

    const documentNotes = (req.body.adminNotes ?? req.body.admin_notes ?? req.body.catatanAdmin ?? '').trim()
    const document = await applications.updateDocumentStatus(req.params.id, req.params.documentId, req.body.status, documentNotes)
    if (!document) throw createHttpError(404, 'Dokumen tidak ditemukan.')

    const application = await applications.getApplicationById(req.params.id)
    await applications.createNotification(application.userId, 'Status dokumen berubah', `Status dokumen ${document.jenisDokumen} menjadi ${document.status}.`)
    return res.json(document)
  } catch (error) {
    return next(error)
  }
}

export const assignApplicationMentor = async (req, res, next) => {
  try {
    requireRoles(req, ['admin', 'pembimbing_lapangan'])
    const application = await applications.getApplicationById(req.params.id)
    if (!application) throw createHttpError(404, 'Pendaftaran magang tidak ditemukan.')
    if (!['accepted', 'verified'].includes(application.status)) {
      throw createHttpError(400, 'Mentor hanya dapat ditetapkan untuk pendaftaran terverifikasi atau diterima.')
    }

    const mentor = await users.findUserById(Number(req.body.mentorId))
    if (!mentor || !['mentor', 'pembimbing_lapangan'].includes(mentor.role)) throw createHttpError(400, 'User mentor tidak valid.')

    const updated = await applications.setApplicationMentor(application.id, mentor.id)
    await applications.upsertMentorAssignment(application.id, mentor.id, req.user.id)
    return res.json(await composeDetail(updated))
  } catch (error) {
    return next(error)
  }
}

export const listMentorApplications = async (req, res, next) => {
  try {
    requireRoles(req, ['mentor', 'pembimbing_lapangan'])
    return res.json(await applications.listMentorApplications(req.user.id))
  } catch (error) {
    return next(error)
  }
}

export const getMentorApplicationDetail = async (req, res, next) => {
  try {
    requireRoles(req, ['mentor', 'pembimbing_lapangan'])
    const detail = await applications.getApplicationDetail(req.params.id)
    if (!detail || detail.application.mentorId !== req.user.id || detail.application.status !== 'accepted') {
      throw createHttpError(403, 'Mentor tidak memiliki akses ke pendaftaran ini.')
    }
    return res.json({ ...detail, application: { ...detail.application, documentSummary: documentSummary(detail.documents) } })
  } catch (error) {
    return next(error)
  }
}
