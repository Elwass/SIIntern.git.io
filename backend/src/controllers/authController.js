import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { pool } from '../config/db.js'

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10)
const MAX_OTP_ATTEMPTS = 5
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m'
const JWT_REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 7)
const jwtSecret = () => process.env.JWT_SECRET || 'siintern-development-secret'

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const setAuthCookie = (res, refreshToken) => {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: String(process.env.COOKIE_SECURE || 'false') === 'true',
    maxAge: JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  })
}

const createOtpCode = () => String(crypto.randomInt(100000, 1000000))
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex')

function getCookie(req, key) {
  const raw = req.headers.cookie || ''
  const item = raw.split(';').map((v) => v.trim()).find((v) => v.startsWith(`${key}=`))
  return item ? decodeURIComponent(item.split('=').slice(1).join('=')) : null
}

async function sendOtpEmail(email, otp, purpose) {
  const purposeText = { signup: 'verifikasi pendaftaran', signin: 'verifikasi login', reset_password: 'reset password' }[purpose]
  await mailer.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Kode OTP ${purposeText}`,
    text: `Kode OTP Anda adalah ${otp}. Berlaku ${OTP_EXPIRY_MINUTES} menit. Jangan bagikan kode ini.`,
  })
}

async function createOtp({ userId, email, purpose }) {
  const otp = createOtpCode()
  const otpHash = await bcrypt.hash(otp, 10)
  await pool.query(
    `INSERT INTO email_otps (user_id, email, purpose, otp_hash, expires_at, attempts)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0)`,
    [userId, email, purpose, otpHash, OTP_EXPIRY_MINUTES],
  )
  await sendOtpEmail(email, otp, purpose)
}

async function verifyOtpRecord({ userId, email, purpose, otp }) {
  const [rows] = await pool.query(
    `SELECT * FROM email_otps WHERE user_id=? AND email=? AND purpose=? AND used_at IS NULL ORDER BY id DESC LIMIT 1`,
    [userId, email, purpose],
  )
  const record = rows[0]
  if (!record) return { ok: false, code: 400, message: 'OTP tidak ditemukan.' }
  if (record.attempts >= MAX_OTP_ATTEMPTS) return { ok: false, code: 429, message: 'Batas percobaan OTP tercapai.' }
  if (new Date(record.expires_at) < new Date()) return { ok: false, code: 400, message: 'OTP sudah kadaluarsa.' }
  const isValid = await bcrypt.compare(otp, record.otp_hash)
  if (!isValid) {
    await pool.query('UPDATE email_otps SET attempts = attempts + 1 WHERE id=?', [record.id])
    return { ok: false, code: 400, message: 'OTP tidak valid.' }
  }
  await pool.query('UPDATE email_otps SET used_at = NOW() WHERE id=?', [record.id])
  return { ok: true }
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, status: user.status, emailVerifiedAt: user.email_verified_at }
}

function issueAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, jwtSecret(), { expiresIn: JWT_ACCESS_EXPIRES })
}

async function issueSession(user, req, res) {
  const refreshToken = crypto.randomBytes(48).toString('hex')
  await pool.query(
    `INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [user.id, sha256(refreshToken), req.headers['user-agent'] || 'unknown', req.ip, JWT_REFRESH_EXPIRES_DAYS],
  )
  setAuthCookie(res, refreshToken)
}

export async function signup(req, res) {
  const { name = '', email = '', password = '', confirmPassword = '' } = req.body
  if (!name.trim() || !emailRegex.test(email) || password.length < 8 || password !== confirmPassword) {
    return res.status(400).json({ message: 'Input tidak valid.' })
  }
  const normalizedEmail = email.trim().toLowerCase()
  const [existing] = await pool.query('SELECT id FROM users WHERE email=? LIMIT 1', [normalizedEmail])
  if (existing.length) return res.status(409).json({ message: 'Email sudah terdaftar.' })
  const passwordHash = await bcrypt.hash(password, 12)
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, status, role) VALUES (?, ?, ?, 'pending', 'student')`,
    [name.trim(), normalizedEmail, passwordHash],
  )
  await createOtp({ userId: result.insertId, email: normalizedEmail, purpose: 'signup' })
  return res.status(201).json({ message: 'Registrasi berhasil. OTP telah dikirim ke email.' })
}

export async function verifySignup(req, res) {
  const { email = '', otp = '' } = req.body
  const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
  const user = rows[0]
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' })
  const v = await verifyOtpRecord({ userId: user.id, email: user.email, purpose: 'signup', otp })
  if (!v.ok) return res.status(v.code).json({ message: v.message })
  await pool.query("UPDATE users SET email_verified_at = NOW(), status='active' WHERE id=?", [user.id])
  return res.json({ message: 'Email berhasil diverifikasi.' })
}

export async function signin(req, res) {
  const { email = '', password = '' } = req.body
  const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: 'Email atau password salah.' })
  if (user.status !== 'active') return res.status(403).json({ message: 'Akun belum aktif atau diblokir.' })
  await createOtp({ userId: user.id, email: user.email, purpose: 'signin' })
  return res.json({ message: 'OTP login telah dikirim.' })
}

export async function verifySignin(req, res) {
  const { email = '', otp = '' } = req.body
  const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
  const user = rows[0]
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' })
  const v = await verifyOtpRecord({ userId: user.id, email: user.email, purpose: 'signin', otp })
  if (!v.ok) return res.status(v.code).json({ message: v.message })
  await issueSession(user, req, res)
  return res.json({ token: issueAccessToken(user), user: publicUser(user) })
}

export async function resendOtp(req, res) {
  const { email = '', purpose = 'signup' } = req.body
  const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
  const user = rows[0]
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' })
  await createOtp({ userId: user.id, email: user.email, purpose })
  return res.json({ message: 'OTP baru telah dikirim.' })
}

export async function forgotPassword(req, res) {
  const { email = '' } = req.body
  const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
  const user = rows[0]
  if (!user) return res.json({ message: 'Jika email terdaftar, OTP reset akan dikirim.' })
  await createOtp({ userId: user.id, email: user.email, purpose: 'reset_password' })
  return res.json({ message: 'Jika email terdaftar, OTP reset akan dikirim.' })
}

export async function resetPassword(req, res) {
  const { email = '', otp = '', password = '', confirmPassword = '' } = req.body
  if (password.length < 8 || password !== confirmPassword) return res.status(400).json({ message: 'Password tidak valid.' })
  const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
  const user = rows[0]
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' })
  const v = await verifyOtpRecord({ userId: user.id, email: user.email, purpose: 'reset_password', otp })
  if (!v.ok) return res.status(v.code).json({ message: v.message })
  await pool.query('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(password, 12), user.id])
  return res.json({ message: 'Password berhasil direset.' })
}

export async function logout(req, res) {
  const token = getCookie(req, 'refresh_token')
  if (token) await pool.query('DELETE FROM sessions WHERE refresh_token_hash=?', [sha256(token)])
  res.clearCookie('refresh_token')
  return res.json({ message: 'Logout berhasil.' })
}

export async function me(req, res) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id=? LIMIT 1', [req.user.id])
  const user = rows[0]
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' })
  return res.json({ user: publicUser(user) })
}
