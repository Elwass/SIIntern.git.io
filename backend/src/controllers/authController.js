import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { users } from '../data/dummyData.js'

const DEFAULT_TOKEN_EXPIRY = '8h'
const jwtSecret = () => process.env.JWT_SECRET || 'siintern-development-secret'

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

function issueToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    jwtSecret(),
    { expiresIn: DEFAULT_TOKEN_EXPIRY },
  )
}

async function passwordMatches(user, password) {
  if (user.passwordHash) return bcrypt.compare(password, user.passwordHash)
  return user.password === password
}

export const login = async (req, res) => {
  const { email = '', password = '' } = req.body
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' })
  }

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail)
  if (!user || !(await passwordMatches(user, password))) {
    return res.status(401).json({ message: 'Email atau password salah.' })
  }

  return res.json({
    token: issueToken(user),
    role: user.role,
    user: publicUser(user),
  })
}

export const register = async (req, res) => {
  const { name = '', email = '', password = '' } = req.body
  const normalizedName = name.trim()
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedName || !normalizedEmail || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Format email tidak valid.' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter.' })
  }

  const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail)
  if (existingUser) {
    return res.status(409).json({ message: 'Email sudah terdaftar.' })
  }

  const newUser = {
    id: Math.max(...users.map((u) => u.id), 0) + 1,
    name: normalizedName,
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'student',
  }

  users.push(newUser)

  return res.status(201).json({
    token: issueToken(newUser),
    role: newUser.role,
    user: publicUser(newUser),
  })
}
