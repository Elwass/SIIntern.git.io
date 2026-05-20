import { pool } from '../config/db.js'

function formatDate(value) {
  return value?.toISOString?.().slice(0, 10) || value || ''
}

function toProfile(row) {
  if (!row || !row.id) return null
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    namaLengkap: row.nama_lengkap,
    nim: row.nim,
    kampus: row.kampus,
    programStudi: row.program_studi,
    semester: row.semester,
    noHp: row.no_hp,
    alamat: row.alamat,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toApplication(row) {
  if (!row) return null
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    bidangMagang: row.bidang_magang,
    periodeMulai: formatDate(row.periode_mulai),
    periodeSelesai: formatDate(row.periode_selesai),
    motivasi: row.motivasi,
    status: row.status,
    catatanAdmin: row.catatan_admin || '',
    adminNotes: row.catatan_admin || '',
    mentorId: row.mentor_id ? Number(row.mentor_id) : null,
    submittedAt: row.submitted_at,
    verifiedAt: row.verified_at,
    acceptedAt: row.accepted_at,
    rejectedAt: row.rejected_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toDocument(row) {
  if (!row) return null
  return {
    id: Number(row.id),
    applicationId: Number(row.application_id),
    userId: Number(row.user_id),
    jenisDokumen: row.jenis_dokumen,
    fileName: row.file_name,
    filePath: row.file_path,
    fileUrl: row.file_url,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    status: row.status,
    catatanAdmin: row.catatan_admin || '',
    adminNotes: row.catatan_admin || '',
    uploadedAt: row.uploaded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toUser(row, prefix = 'user') {
  if (!row?.[`${prefix}_id`]) return null
  return {
    id: Number(row[`${prefix}_id`]),
    name: row[`${prefix}_name`],
    email: row[`${prefix}_email`],
    role: row[`${prefix}_role`],
  }
}

export async function getStudentProfile(userId) {
  const [rows] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ? LIMIT 1', [userId])
  return toProfile(rows[0])
}

export async function upsertStudentProfile(userId, payload) {
  await pool.query(
    `INSERT INTO student_profiles (user_id, nama_lengkap, nim, kampus, program_studi, semester, no_hp, alamat)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       nama_lengkap = VALUES(nama_lengkap),
       nim = VALUES(nim),
       kampus = VALUES(kampus),
       program_studi = VALUES(program_studi),
       semester = VALUES(semester),
       no_hp = VALUES(no_hp),
       alamat = VALUES(alamat),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, payload.namaLengkap, payload.nim, payload.kampus, payload.programStudi, payload.semester, payload.noHp, payload.alamat],
  )
  return getStudentProfile(userId)
}

export async function getCurrentApplication(userId) {
  const [rows] = await pool.query(
    `SELECT * FROM internship_applications
     WHERE user_id = ? AND status IN ('draft','pending','verified','accepted','rejected')
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  )
  return toApplication(rows[0])
}

export async function getApplicationById(id) {
  const [rows] = await pool.query('SELECT * FROM internship_applications WHERE id = ? LIMIT 1', [id])
  return toApplication(rows[0])
}

export async function createApplication(userId, payload) {
  const [result] = await pool.query(
    `INSERT INTO internship_applications (user_id, bidang_magang, periode_mulai, periode_selesai, motivasi, status, submitted_at)
     VALUES (?, ?, ?, ?, ?, 'draft', NULL)`,
    [userId, payload.bidangMagang, payload.periodeMulai, payload.periodeSelesai, payload.motivasi],
  )
  return getApplicationById(result.insertId)
}

export async function findApplicationByUserAndPeriod(userId, periodeMulai, periodeSelesai) {
  const [rows] = await pool.query(
    `SELECT * FROM internship_applications
     WHERE user_id = ? AND periode_mulai = ? AND periode_selesai = ?
     ORDER BY created_at DESC LIMIT 1`,
    [userId, periodeMulai, periodeSelesai],
  )
  return toApplication(rows[0])
}

export async function updateApplication(id, payload) {
  await pool.query(
    `UPDATE internship_applications
     SET bidang_magang = ?, periode_mulai = ?, periode_selesai = ?, motivasi = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [payload.bidangMagang, payload.periodeMulai, payload.periodeSelesai, payload.motivasi, id],
  )
  return getApplicationById(id)
}

export async function setApplicationStatus(id, status, catatanAdmin = '') {
  const timestampColumn = { pending: 'submitted_at', verified: 'verified_at', accepted: 'accepted_at', rejected: 'rejected_at' }[status]
  const timestampSql = timestampColumn ? `, ${timestampColumn} = CURRENT_TIMESTAMP` : ''
  await pool.query(
    `UPDATE internship_applications
     SET status = ?, catatan_admin = ?, updated_at = CURRENT_TIMESTAMP${timestampSql}
     WHERE id = ?`,
    [status, catatanAdmin, id],
  )
  return getApplicationById(id)
}

export async function setApplicationMentor(id, mentorId) {
  await pool.query(
    `UPDATE internship_applications SET mentor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [mentorId, id],
  )
  return getApplicationById(id)
}

export async function upsertMentorAssignment(applicationId, mentorId, assignedBy) {
  await pool.query(
    `INSERT INTO mentor_assignments (application_id, mentor_id, assigned_by)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE mentor_id = VALUES(mentor_id), assigned_by = VALUES(assigned_by), assigned_at = CURRENT_TIMESTAMP`,
    [applicationId, mentorId, assignedBy],
  )
}

export async function listDocuments(applicationId) {
  const [rows] = await pool.query(
    `SELECT d.*
     FROM application_documents d
     JOIN internship_applications a ON a.id = d.application_id
     WHERE d.application_id = ?
     ORDER BY d.jenis_dokumen ASC`,
    [applicationId],
  )
  return rows.map(toDocument)
}

export async function countUploadedRequiredDocuments(applicationId) {
  const [rows] = await pool.query(
    `SELECT COUNT(DISTINCT d.jenis_dokumen) AS total
     FROM application_documents d
     JOIN internship_applications a ON a.id = d.application_id
     WHERE d.application_id = ?`,
    [applicationId],
  )
  return Number(rows[0]?.total || 0)
}

export async function upsertDocument(payload) {
  await pool.query(
    `INSERT INTO application_documents (application_id, user_id, jenis_dokumen, file_name, file_path, file_url, mime_type, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       file_name = VALUES(file_name),
       file_path = VALUES(file_path),
       file_url = VALUES(file_url),
       mime_type = VALUES(mime_type),
       file_size = VALUES(file_size),
       status = 'uploaded',
       catatan_admin = '',
       uploaded_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP`,
    [payload.applicationId, payload.userId, payload.jenisDokumen, payload.fileName, payload.filePath, payload.fileUrl, payload.mimeType, payload.fileSize],
  )
  const [rows] = await pool.query(
    'SELECT * FROM application_documents WHERE application_id = ? AND jenis_dokumen = ? LIMIT 1',
    [payload.applicationId, payload.jenisDokumen],
  )
  return toDocument(rows[0])
}

export async function deleteDocument(applicationId, documentId) {
  const [rows] = await pool.query('SELECT * FROM application_documents WHERE application_id = ? AND id = ? LIMIT 1', [applicationId, documentId])
  if (!rows[0]) return null
  await pool.query('DELETE FROM application_documents WHERE application_id = ? AND id = ?', [applicationId, documentId])
  return toDocument(rows[0])
}

export async function updateDocumentStatus(applicationId, documentId, status, catatanAdmin = '') {
  await pool.query(
    `UPDATE application_documents SET status = ?, catatan_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ? AND id = ?`,
    [status, catatanAdmin, applicationId, documentId],
  )
  const [rows] = await pool.query('SELECT * FROM application_documents WHERE application_id = ? AND id = ? LIMIT 1', [applicationId, documentId])
  return toDocument(rows[0])
}

export async function listAdminApplications({ status = '', bidangMagang = '', search = '', page = 1, limit = 10 }) {
  const params = []
  const where = []
  if (status) { where.push('a.status = ?'); params.push(status) }
  if (bidangMagang) { where.push('a.bidang_magang = ?'); params.push(bidangMagang) }
  if (search) {
    where.push('(LOWER(p.nama_lengkap) LIKE ? OR LOWER(p.nim) LIKE ? OR LOWER(u.email) LIKE ?)')
    const term = `%${search.toLowerCase()}%`
    params.push(term, term, term)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM internship_applications a
     JOIN (
       SELECT user_id, MAX(created_at) AS latest_created_at
       FROM internship_applications
       WHERE status <> 'draft'
       GROUP BY user_id
     ) latest ON latest.user_id = a.user_id AND latest.latest_created_at = a.created_at
     JOIN users u ON u.id = a.user_id
     LEFT JOIN student_profiles p ON p.user_id = a.user_id
     ${whereSql}`,
    params,
  )
  const pageNumber = Math.max(Number(page), 1)
  const limitNumber = Math.max(Number(limit), 1)
  const offset = (pageNumber - 1) * limitNumber
  const [rows] = await pool.query(
    `SELECT a.*, p.nama_lengkap, p.nim, p.kampus, u.email
     FROM internship_applications a
     JOIN (
       SELECT user_id, MAX(created_at) AS latest_created_at
       FROM internship_applications
       WHERE status <> 'draft'
       GROUP BY user_id
     ) latest ON latest.user_id = a.user_id AND latest.latest_created_at = a.created_at
     JOIN users u ON u.id = a.user_id
     LEFT JOIN student_profiles p ON p.user_id = a.user_id
     ${whereSql}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limitNumber, offset],
  )
  return {
    data: rows.map((row) => ({ ...toApplication(row), namaLengkap: row.nama_lengkap, nim: row.nim, kampus: row.kampus, email: row.email })),
    total: Number(countRows[0]?.total || 0),
  }
}

export async function getApplicationDetail(id) {
  const [rows] = await pool.query(
    `SELECT a.*,
       u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role,
       p.id AS profile_id, p.nama_lengkap, p.nim, p.kampus, p.program_studi, p.semester, p.no_hp, p.alamat, p.created_at AS profile_created_at, p.updated_at AS profile_updated_at,
       m.id AS mentor_id, m.name AS mentor_name, m.email AS mentor_email, m.role AS mentor_role
     FROM internship_applications a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN student_profiles p ON p.user_id = a.user_id
     LEFT JOIN users m ON m.id = a.mentor_id
     WHERE a.id = ? LIMIT 1`,
    [id],
  )
  const row = rows[0]
  if (!row) return null
  return {
    user: toUser(row, 'user'),
    profile: toProfile({ id: row.profile_id, user_id: row.user_id, nama_lengkap: row.nama_lengkap, nim: row.nim, kampus: row.kampus, program_studi: row.program_studi, semester: row.semester, no_hp: row.no_hp, alamat: row.alamat, created_at: row.profile_created_at, updated_at: row.profile_updated_at }),
    application: toApplication(row),
    mentor: toUser(row, 'mentor'),
    documents: await listDocuments(id),
  }
}

export async function listMentorApplications(mentorId) {
  const [rows] = await pool.query(
    `SELECT a.*, p.nama_lengkap, p.nim, p.kampus
     FROM internship_applications a
     LEFT JOIN student_profiles p ON p.user_id = a.user_id
     WHERE a.mentor_id = ? AND a.status = 'accepted'
     ORDER BY COALESCE(a.accepted_at, a.updated_at) DESC`,
    [mentorId],
  )
  return rows.map((row) => ({ ...toApplication(row), namaLengkap: row.nama_lengkap, nim: row.nim, kampus: row.kampus }))
}

export async function createNotification(userId, title, message) {
  await pool.query('INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)', [userId, title, message])
}
