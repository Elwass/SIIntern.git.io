import { pool } from '../config/db.js'

function toProfile(row) {
  if (!row || !row.id) return null
  return {
    id: Number(row.id), userId: Number(row.user_id), namaLengkap: row.nama_lengkap, nim: row.nim,
    kampus: row.kampus, programStudi: row.program_studi, semester: row.semester,
    noHp: row.no_hp, alamat: row.alamat, createdAt: row.created_at, updatedAt: row.updated_at,
  }
}
function toApplication(row) {
  if (!row) return null
  return {
    id: Number(row.id), userId: Number(row.user_id), bidangMagang: row.bidang_magang,
    periodeMulai: row.periode_mulai?.toISOString?.().slice(0, 10) || row.periode_mulai,
    periodeSelesai: row.periode_selesai?.toISOString?.().slice(0, 10) || row.periode_selesai,
    motivasi: row.motivasi, status: row.status, catatanAdmin: row.catatan_admin || '',
    mentorId: row.mentor_id ? Number(row.mentor_id) : null, submittedAt: row.submitted_at,
    verifiedAt: row.verified_at, acceptedAt: row.accepted_at, rejectedAt: row.rejected_at,
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}
function toDocument(row) {
  if (!row) return null
  return {
    id: Number(row.id), applicationId: Number(row.application_id), userId: Number(row.user_id),
    jenisDokumen: row.jenis_dokumen, fileName: row.file_name, filePath: row.file_path,
    fileUrl: row.file_url, mimeType: row.mime_type, fileSize: row.file_size, status: row.status,
    catatanAdmin: row.catatan_admin || '', uploadedAt: row.uploaded_at, createdAt: row.created_at, updatedAt: row.updated_at,
  }
}
function toUser(row, prefix = 'user') {
  if (!row?.[`${prefix}_id`]) return null
  return { id: Number(row[`${prefix}_id`]), name: row[`${prefix}_name`], email: row[`${prefix}_email`], role: row[`${prefix}_role`] }
}

export async function getStudentProfile(userId) {
  const result = await pool.query('SELECT * FROM student_profiles WHERE user_id = $1 LIMIT 1', [userId])
  return toProfile(result.rows[0])
}

export async function upsertStudentProfile(userId, payload) {
  const result = await pool.query(
    `INSERT INTO student_profiles (user_id, nama_lengkap, nim, kampus, program_studi, semester, no_hp, alamat)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (user_id) DO UPDATE SET
       nama_lengkap = EXCLUDED.nama_lengkap,
       nim = EXCLUDED.nim,
       kampus = EXCLUDED.kampus,
       program_studi = EXCLUDED.program_studi,
       semester = EXCLUDED.semester,
       no_hp = EXCLUDED.no_hp,
       alamat = EXCLUDED.alamat,
       updated_at = NOW()
     RETURNING *`,
    [userId, payload.namaLengkap, payload.nim, payload.kampus, payload.programStudi, payload.semester, payload.noHp, payload.alamat],
  )
  return toProfile(result.rows[0])
}

export async function getCurrentApplication(userId) {
  const result = await pool.query(
    `SELECT * FROM internship_applications
     WHERE user_id = $1 AND status IN ('draft','submitted','needs_revision','verified','accepted')
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  )
  return toApplication(result.rows[0])
}

export async function getApplicationById(id) {
  const result = await pool.query('SELECT * FROM internship_applications WHERE id = $1 LIMIT 1', [id])
  return toApplication(result.rows[0])
}

export async function createApplication(userId, payload) {
  const result = await pool.query(
    `INSERT INTO internship_applications (user_id, bidang_magang, periode_mulai, periode_selesai, motivasi, status)
     VALUES ($1,$2,$3,$4,$5,'draft') RETURNING *`,
    [userId, payload.bidangMagang, payload.periodeMulai, payload.periodeSelesai, payload.motivasi],
  )
  return toApplication(result.rows[0])
}

export async function updateApplication(id, payload) {
  const result = await pool.query(
    `UPDATE internship_applications
     SET bidang_magang=$2, periode_mulai=$3, periode_selesai=$4, motivasi=$5, updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [id, payload.bidangMagang, payload.periodeMulai, payload.periodeSelesai, payload.motivasi],
  )
  return toApplication(result.rows[0])
}

export async function setApplicationStatus(id, status, catatanAdmin = '') {
  const timestampColumn = { submitted: 'submitted_at', verified: 'verified_at', accepted: 'accepted_at', rejected: 'rejected_at' }[status]
  const timestampSql = timestampColumn ? `, ${timestampColumn}=NOW()` : ''
  const result = await pool.query(
    `UPDATE internship_applications SET status=$2, catatan_admin=$3, updated_at=NOW()${timestampSql} WHERE id=$1 RETURNING *`,
    [id, status, catatanAdmin],
  )
  return toApplication(result.rows[0])
}

export async function setApplicationMentor(id, mentorId) {
  const result = await pool.query(
    `UPDATE internship_applications SET mentor_id=$2, updated_at=NOW() WHERE id=$1 RETURNING *`,
    [id, mentorId],
  )
  return toApplication(result.rows[0])
}

export async function upsertMentorAssignment(applicationId, mentorId, assignedBy) {
  await pool.query(
    `INSERT INTO mentor_assignments (application_id, mentor_id, assigned_by)
     VALUES ($1,$2,$3)
     ON CONFLICT (application_id) DO UPDATE SET mentor_id=EXCLUDED.mentor_id, assigned_by=EXCLUDED.assigned_by, assigned_at=NOW()`,
    [applicationId, mentorId, assignedBy],
  )
}

export async function listDocuments(applicationId) {
  const result = await pool.query('SELECT * FROM application_documents WHERE application_id=$1 ORDER BY jenis_dokumen ASC', [applicationId])
  return result.rows.map(toDocument)
}

export async function upsertDocument(payload) {
  const result = await pool.query(
    `INSERT INTO application_documents (application_id, user_id, jenis_dokumen, file_name, file_path, file_url, mime_type, file_size)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (application_id, jenis_dokumen) DO UPDATE SET
       file_name=EXCLUDED.file_name,
       file_path=EXCLUDED.file_path,
       file_url=EXCLUDED.file_url,
       mime_type=EXCLUDED.mime_type,
       file_size=EXCLUDED.file_size,
       status='uploaded',
       catatan_admin='',
       uploaded_at=NOW(),
       updated_at=NOW()
     RETURNING *`,
    [payload.applicationId, payload.userId, payload.jenisDokumen, payload.fileName, payload.filePath, payload.fileUrl, payload.mimeType, payload.fileSize],
  )
  return toDocument(result.rows[0])
}

export async function deleteDocument(applicationId, documentId) {
  const result = await pool.query('DELETE FROM application_documents WHERE application_id=$1 AND id=$2 RETURNING *', [applicationId, documentId])
  return toDocument(result.rows[0])
}

export async function updateDocumentStatus(applicationId, documentId, status, catatanAdmin = '') {
  const result = await pool.query(
    `UPDATE application_documents SET status=$3, catatan_admin=$4, updated_at=NOW() WHERE application_id=$1 AND id=$2 RETURNING *`,
    [applicationId, documentId, status, catatanAdmin],
  )
  return toDocument(result.rows[0])
}

export async function listAdminApplications({ status = '', bidangMagang = '', search = '', page = 1, limit = 10 }) {
  const params = []
  const where = []
  if (status) { params.push(status); where.push(`a.status = $${params.length}`) }
  if (bidangMagang) { params.push(bidangMagang); where.push(`a.bidang_magang = $${params.length}`) }
  if (search) {
    params.push(`%${search.toLowerCase()}%`)
    where.push(`(LOWER(p.nama_lengkap) LIKE $${params.length} OR LOWER(p.nim) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const count = await pool.query(`SELECT COUNT(*)::int AS total FROM internship_applications a JOIN users u ON u.id=a.user_id LEFT JOIN student_profiles p ON p.user_id=a.user_id ${whereSql}`, params)
  const offset = (Math.max(Number(page), 1) - 1) * Math.max(Number(limit), 1)
  params.push(Math.max(Number(limit), 1), offset)
  const result = await pool.query(
    `SELECT a.*, p.nama_lengkap, p.nim, p.kampus, u.email
     FROM internship_applications a
     JOIN users u ON u.id=a.user_id
     LEFT JOIN student_profiles p ON p.user_id=a.user_id
     ${whereSql}
     ORDER BY a.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )
  return { data: result.rows.map((row) => ({ ...toApplication(row), namaLengkap: row.nama_lengkap, nim: row.nim, kampus: row.kampus, email: row.email })), total: count.rows[0]?.total || 0 }
}

export async function getApplicationDetail(id) {
  const result = await pool.query(
    `SELECT a.*,
       u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role,
       p.id AS profile_id, p.nama_lengkap, p.nim, p.kampus, p.program_studi, p.semester, p.no_hp, p.alamat, p.created_at AS profile_created_at, p.updated_at AS profile_updated_at,
       m.id AS mentor_id, m.name AS mentor_name, m.email AS mentor_email, m.role AS mentor_role
     FROM internship_applications a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN student_profiles p ON p.user_id = a.user_id
     LEFT JOIN users m ON m.id = a.mentor_id
     WHERE a.id=$1 LIMIT 1`,
    [id],
  )
  const row = result.rows[0]
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
  const result = await pool.query(
    `SELECT a.*, p.nama_lengkap, p.nim, p.kampus
     FROM internship_applications a
     LEFT JOIN student_profiles p ON p.user_id=a.user_id
     WHERE a.mentor_id=$1 AND a.status='accepted'
     ORDER BY a.accepted_at DESC NULLS LAST, a.updated_at DESC`,
    [mentorId],
  )
  return result.rows.map((row) => ({ ...toApplication(row), namaLengkap: row.nama_lengkap, nim: row.nim, kampus: row.kampus }))
}

export async function createNotification(userId, title, message) {
  await pool.query('INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)', [userId, title, message])
}
