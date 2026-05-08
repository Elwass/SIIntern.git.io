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
  const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email])
  return toUser(result.rows[0])
}

export async function findUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id])
  return toUser(result.rows[0])
}

export async function createUser({ name, email, passwordHash, role = 'student' }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, LOWER($2), $3, $4)
     RETURNING *`,
    [name, email, passwordHash, role],
  )
  return toUser(result.rows[0])
}

export async function listMentors() {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at, updated_at
     FROM users
     WHERE role = 'mentor'
     ORDER BY name ASC`,
  )
  return result.rows.map(toUser)
}
