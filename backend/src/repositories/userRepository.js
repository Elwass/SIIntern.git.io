import { pool } from '../config/db.js'

function toUser(row) {
  if (!row) return null
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [email])
  return toUser(rows[0])
}

export async function findUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id])
  return toUser(rows[0])
}

export async function createUser({ name, email, passwordHash, role = 'student' }) {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, LOWER(?), ?, ?)`,
    [name, email, passwordHash, role],
  )
  return findUserById(result.insertId)
}

export async function listMentors() {
  const [rows] = await pool.query(
    `SELECT id, name, email, role, created_at, updated_at
     FROM users
     WHERE role = 'mentor'
     ORDER BY name ASC`,
  )
  return rows.map(toUser)
}

export async function updateMentor(id, payload = {}) {
  await pool.query(
    `UPDATE users
     SET name = ?, email = LOWER(?), updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND role = 'mentor'`,
    [payload.name, payload.email, id],
  )
  return findUserById(id)
}

export async function deleteMentor(id) {
  const mentor = await findUserById(id)
  if (!mentor || mentor.role !== 'mentor') return null
  await pool.query('DELETE FROM users WHERE id = ? AND role = ?', [id, 'mentor'])
  return mentor
}
