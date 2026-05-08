import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as defaultUsers from '../repositories/userRepository.js'

const DEFAULT_TOKEN_EXPIRY = '8h'
const jwtSecret = () => process.env.JWT_SECRET || 'siintern-development-secret'
let users = defaultUsers

export function setUserRepositoryForTests(repository) {
  users = repository || defaultUsers
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

function issueToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, jwtSecret(), { expiresIn: DEFAULT_TOKEN_EXPIRY })
}

export const me = async (req, res) => {
  const user = await users.findUserById(req.user.id)
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' })
  return res.json({ user: publicUser(user) })
}

export const login = async (req, res) => {
  const { email = '', password = '' } = req.body
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !password) return res.status(400).json({ message: 'Email dan password wajib diisi.' })

  const user = await users.findUserByEmail(normalizedEmail)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email atau password salah.' })
  }

  return res.json({ token: issueToken(user), role: user.role, user: publicUser(user) })
}

export const register = async (req, res) => {
  const { name = '', email = '', password = '' } = req.body
  const normalizedName = name.trim()
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedName || !normalizedEmail || !password) return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ message: 'Format email tidak valid.' })
  if (password.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter.' })

  const existingUser = await users.findUserByEmail(normalizedEmail)
  if (existingUser) return res.status(409).json({ message: 'Email sudah terdaftar.' })

  const user = await users.createUser({ name: normalizedName, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 10), role: 'student' })
  return res.status(201).json({ token: issueToken(user), role: user.role, user: publicUser(user) })
}
