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
     WHERE role IN ('mentor', 'pembimbing_lapangan')
     ORDER BY name ASC`,
  )
  return rows.map(toUser)
}
