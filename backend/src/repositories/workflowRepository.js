import { pool } from '../config/db.js'

function formatDate(value) { return value?.toISOString?.().slice(0, 10) || value || '' }
function formatDateTime(value) { return value || null }

export function toLogbook(row) {
  if (!row) return null
  return {
    id: Number(row.id), applicationId: Number(row.application_id), userId: Number(row.user_id), mentorId: row.mentor_id ? Number(row.mentor_id) : null,
    activityDate: formatDate(row.activity_date), title: row.title, description: row.description, output: row.output || '',
    supportingFileName: row.supporting_file_name || '', supportingFilePath: row.supporting_file_path || '', supportingFileUrl: row.supporting_file_url || '',
    status: row.status, feedback: row.feedback || '', reviewedBy: row.reviewed_by ? Number(row.reviewed_by) : null, reviewedAt: formatDateTime(row.reviewed_at),
    createdAt: row.created_at, updatedAt: row.updated_at,
    namaLengkap: row.nama_lengkap, nim: row.nim, bidangMagang: row.bidang_magang,
  }
}

export function toAttendance(row) {
  if (!row) return null
  return {
    id: Number(row.id), applicationId: Number(row.application_id), userId: Number(row.user_id), mentorId: row.mentor_id ? Number(row.mentor_id) : null,
    attendanceDate: formatDate(row.attendance_date), checkInAt: row.check_in_at, checkOutAt: row.check_out_at, status: row.status,
    proofType: row.proof_type || '', proofFileName: row.proof_file_name || '', proofFilePath: row.proof_file_path || '', proofFileUrl: row.proof_file_url || '',
    notes: row.notes || '', correctedBy: row.corrected_by ? Number(row.corrected_by) : null, createdBy: row.created_by ? Number(row.created_by) : null,
    createdAt: row.created_at, updatedAt: row.updated_at,
    namaLengkap: row.nama_lengkap, nim: row.nim, bidangMagang: row.bidang_magang,
  }
}

export function toEvaluation(row) {
  if (!row) return null
  return {
    id: Number(row.id), applicationId: Number(row.application_id), userId: Number(row.user_id), mentorId: Number(row.mentor_id),
    performanceScore: Number(row.performance_score), softSkillsScore: Number(row.soft_skills_score), logbookScore: Number(row.logbook_score), finalScore: Number(row.final_score),
    grade: row.grade, feedback: row.feedback || '', createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

export async function getApplicationAccess(applicationId) {
  const [rows] = await pool.query(
    `SELECT a.*, u.email AS student_email, u.name AS student_name, p.nama_lengkap, p.nim, m.email AS mentor_email, m.name AS mentor_name
     FROM internship_applications a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN student_profiles p ON p.user_id = a.user_id
     LEFT JOIN users m ON m.id = a.mentor_id
     WHERE a.id = ? LIMIT 1`,
    [applicationId],
  )
  return rows[0] || null
}

export async function createAuditLog({ actorId, action, entityType, entityId, applicationId, before = null, after = null }) {
  await pool.query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, application_id, before_json, after_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [actorId || null, action, entityType, entityId || null, applicationId || null, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null],
  )
}

export async function createNotification(userId, title, message, relatedType = null, relatedId = null) {
  if (!userId) return
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, related_type, related_id) VALUES (?, ?, ?, ?, ?)`,
    [userId, title, message, relatedType, relatedId],
  )
}

export async function listNotifications(userId) {
  const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [userId])
  return rows.map((row) => ({ id: Number(row.id), userId: Number(row.user_id), title: row.title, message: row.message, relatedType: row.related_type || null, relatedId: row.related_id ? Number(row.related_id) : null, readAt: row.read_at, createdAt: row.created_at }))
}

export async function markNotificationRead(userId, id) {
  await pool.query('UPDATE notifications SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE id = ? AND user_id = ?', [id, userId])
}

export async function upsertLogbook(payload) {
  if (payload.id) {
    const [beforeRows] = await pool.query('SELECT * FROM logbook_entries WHERE id = ? AND application_id = ? LIMIT 1', [payload.id, payload.applicationId])
    await pool.query(
      `UPDATE logbook_entries SET activity_date = ?, title = ?, description = ?, output = ?, supporting_file_name = ?, supporting_file_path = ?, supporting_file_url = ?, status = 'pending', feedback = '', reviewed_by = NULL, reviewed_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND application_id = ?`,
      [payload.activityDate, payload.title, payload.description, payload.output, payload.supportingFileName || '', payload.supportingFilePath || '', payload.supportingFileUrl || '', payload.id, payload.applicationId],
    )
    const entry = await getLogbookById(payload.applicationId, payload.id)
    return { before: toLogbook(beforeRows[0]), entry }
  }
  const [result] = await pool.query(
    `INSERT INTO logbook_entries (application_id, user_id, mentor_id, activity_date, title, description, output, supporting_file_name, supporting_file_path, supporting_file_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [payload.applicationId, payload.userId, payload.mentorId || null, payload.activityDate, payload.title, payload.description, payload.output, payload.supportingFileName || '', payload.supportingFilePath || '', payload.supportingFileUrl || ''],
  )
  return { before: null, entry: await getLogbookById(payload.applicationId, result.insertId) }
}

export async function listLogbooks({ applicationId, userId, mentorId, status = '' }) {
  const params = []
  const where = []
  if (applicationId) { where.push('l.application_id = ?'); params.push(applicationId) }
  if (userId) { where.push('l.user_id = ?'); params.push(userId) }
  if (mentorId) { where.push('a.mentor_id = ?'); params.push(mentorId) }
  if (status) { where.push('l.status = ?'); params.push(status) }
  const [rows] = await pool.query(
    `SELECT l.*, p.nama_lengkap, p.nim, a.bidang_magang
     FROM logbook_entries l
     JOIN internship_applications a ON a.id = l.application_id
     LEFT JOIN student_profiles p ON p.user_id = l.user_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY l.activity_date DESC, l.created_at DESC`,
    params,
  )
  return rows.map(toLogbook)
}

export async function getLogbookById(applicationId, id) {
  const [rows] = await pool.query('SELECT * FROM logbook_entries WHERE application_id = ? AND id = ? LIMIT 1', [applicationId, id])
  return toLogbook(rows[0])
}

export async function reviewLogbook(applicationId, id, { status, feedback, reviewerId }) {
  const before = await getLogbookById(applicationId, id)
  await pool.query(
    `UPDATE logbook_entries SET status = ?, feedback = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE application_id = ? AND id = ?`,
    [status, feedback || '', reviewerId, applicationId, id],
  )
  return { before, entry: await getLogbookById(applicationId, id) }
}

export async function deleteLogbook(applicationId, id) {
  const before = await getLogbookById(applicationId, id)
  if (!before) return null
  await pool.query('DELETE FROM logbook_entries WHERE application_id = ? AND id = ?', [applicationId, id])
  return before
}

export async function upsertAttendance(payload) {
  const [beforeRows] = await pool.query('SELECT * FROM attendance_records WHERE application_id = ? AND attendance_date = ? LIMIT 1', [payload.applicationId, payload.attendanceDate])
  await pool.query(
    `INSERT INTO attendance_records (application_id, user_id, mentor_id, attendance_date, check_in_at, check_out_at, status, proof_type, proof_file_name, proof_file_path, proof_file_url, notes, corrected_by, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       mentor_id = VALUES(mentor_id), check_in_at = COALESCE(VALUES(check_in_at), check_in_at), check_out_at = COALESCE(VALUES(check_out_at), check_out_at),
       status = VALUES(status), proof_type = VALUES(proof_type), proof_file_name = VALUES(proof_file_name), proof_file_path = VALUES(proof_file_path), proof_file_url = VALUES(proof_file_url),
       notes = VALUES(notes), corrected_by = VALUES(corrected_by), updated_at = CURRENT_TIMESTAMP`,
    [payload.applicationId, payload.userId, payload.mentorId || null, payload.attendanceDate, payload.checkInAt || null, payload.checkOutAt || null, payload.status, payload.proofType || '', payload.proofFileName || '', payload.proofFilePath || '', payload.proofFileUrl || '', payload.notes || '', payload.correctedBy || null, payload.createdBy || null],
  )
  const [rows] = await pool.query('SELECT * FROM attendance_records WHERE application_id = ? AND attendance_date = ? LIMIT 1', [payload.applicationId, payload.attendanceDate])
  return { before: toAttendance(beforeRows[0]), attendance: toAttendance(rows[0]) }
}

export async function listAttendance({ applicationId, userId, mentorId, from = '', to = '', status = '' }) {
  const params = []
  const where = []
  if (applicationId) { where.push('r.application_id = ?'); params.push(applicationId) }
  if (userId) { where.push('r.user_id = ?'); params.push(userId) }
  if (mentorId) { where.push('a.mentor_id = ?'); params.push(mentorId) }
  if (from) { where.push('r.attendance_date >= ?'); params.push(from) }
  if (to) { where.push('r.attendance_date <= ?'); params.push(to) }
  if (status) { where.push('r.status = ?'); params.push(status) }
  const [rows] = await pool.query(
    `SELECT r.*, p.nama_lengkap, p.nim, a.bidang_magang
     FROM attendance_records r
     JOIN internship_applications a ON a.id = r.application_id
     LEFT JOIN student_profiles p ON p.user_id = r.user_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY r.attendance_date DESC, r.created_at DESC`, params)
  return rows.map(toAttendance)
}

export async function upsertEvaluation(payload) {
  await pool.query(
    `INSERT INTO evaluations (application_id, user_id, mentor_id, performance_score, soft_skills_score, logbook_score, final_score, grade, feedback)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE performance_score = VALUES(performance_score), soft_skills_score = VALUES(soft_skills_score), logbook_score = VALUES(logbook_score), final_score = VALUES(final_score), grade = VALUES(grade), feedback = VALUES(feedback), updated_at = CURRENT_TIMESTAMP`,
    [payload.applicationId, payload.userId, payload.mentorId, payload.performanceScore, payload.softSkillsScore, payload.logbookScore, payload.finalScore, payload.grade, payload.feedback || ''],
  )
  const [rows] = await pool.query('SELECT * FROM evaluations WHERE application_id = ? LIMIT 1', [payload.applicationId])
  return toEvaluation(rows[0])
}

export async function getEvaluation(applicationId) {
  const [rows] = await pool.query('SELECT * FROM evaluations WHERE application_id = ? LIMIT 1', [applicationId])
  return toEvaluation(rows[0])
}

export async function dashboardSummary() {
  const [apps] = await pool.query('SELECT status, COUNT(*) AS total FROM internship_applications GROUP BY status')
  const [docs] = await pool.query('SELECT status, COUNT(*) AS total FROM application_documents GROUP BY status')
  const [attendance] = await pool.query('SELECT status, COUNT(*) AS total FROM attendance_records GROUP BY status')
  const [mentors] = await pool.query(`SELECT u.id, u.name, COUNT(a.id) AS student_count, AVG(e.final_score) AS average_score FROM users u LEFT JOIN internship_applications a ON a.mentor_id = u.id LEFT JOIN evaluations e ON e.application_id = a.id WHERE u.role = 'mentor' GROUP BY u.id, u.name ORDER BY u.name`)
  return { applications: apps, documents: docs, attendance, mentors }
}
