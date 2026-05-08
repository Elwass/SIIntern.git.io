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

export const login = (req, res) => {
  const { email, password } = req.body
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' })
  return res.json({ token, role: user.role })
}
