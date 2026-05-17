import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { pool } from '../config/db.js'

const OTP_EXPIRY_MINUTES = 10
const MAX_OTP_ATTEMPTS = 5
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m'
const JWT_REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 7)
const jwtSecret = () => process.env.JWT_SECRET || 'siintern-development-secret'

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const purposeMap = new Set(['signup', 'signin', 'reset_password'])
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex')

function createError(message, statusCode = 500) {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

function getCookie(req, key) {
  const raw = req.headers.cookie || ''
  const item = raw.split(';').map((v) => v.trim()).find((v) => v.startsWith(`${key}=`))
  return item ? decodeURIComponent(item.split('=').slice(1).join('=')) : null
}

function setAuthCookie(res, refreshToken) {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: String(process.env.COOKIE_SECURE || 'false') === 'true',
    maxAge: JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  })
}

function createOtpCode() {
  return String(crypto.randomInt(100000, 1000000))
}

async function sendOtpEmail(email, otp, purpose) {
  const purposeText = {
    signup: 'verifikasi pendaftaran',
    signin: 'verifikasi login',
    reset_password: 'reset password',
  }[purpose]

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
  if (!record) throw createError('OTP tidak ditemukan.', 400)
  if (record.attempts >= MAX_OTP_ATTEMPTS) throw createError('Batas percobaan OTP tercapai.', 429)
  if (new Date(record.expires_at) < new Date()) throw createError('OTP sudah kadaluarsa.', 400)

  const isValid = await bcrypt.compare(otp, record.otp_hash)
  if (!isValid) {
    await pool.query('UPDATE email_otps SET attempts = attempts + 1 WHERE id=?', [record.id])
    throw createError('OTP tidak valid.', 400)
  }

  await pool.query('UPDATE email_otps SET used_at = NOW() WHERE id=?', [record.id])
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    emailVerifiedAt: user.email_verified_at,
  }
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

export async function signup(req, res, next) {
  try {
    const { name = '', email = '', password = '', confirmPassword = '' } = req.body
    if (!name.trim() || !emailRegex.test(email) || password.length < 8 || password !== confirmPassword) {
      throw createError('Input tidak valid.', 400)
    }

    const normalizedEmail = email.trim().toLowerCase()
    const [existing] = await pool.query('SELECT id FROM users WHERE email=? LIMIT 1', [normalizedEmail])
    if (existing.length) throw createError('Email sudah terdaftar.', 409)

    const passwordHash = await bcrypt.hash(password, 12)
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, status, role) VALUES (?, ?, ?, 'pending', 'student')`,
      [name.trim(), normalizedEmail, passwordHash],
    )

    await createOtp({ userId: result.insertId, email: normalizedEmail, purpose: 'signup' })
    return res.status(201).json({ message: 'Registrasi berhasil. OTP telah dikirim ke email.' })
  } catch (err) {
    return next(err)
  }
}

export async function verifySignup(req, res, next) {
  try {
    const { email = '', otp = '' } = req.body
    if (!emailRegex.test(email) || !/^\d{6}$/.test(otp)) throw createError('Email/OTP tidak valid.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
    const user = rows[0]
    if (!user) throw createError('User tidak ditemukan.', 404)

    await verifyOtpRecord({ userId: user.id, email: user.email, purpose: 'signup', otp })
    await pool.query("UPDATE users SET email_verified_at = NOW(), status='active' WHERE id=?", [user.id])

    return res.json({ message: 'Email berhasil diverifikasi.' })
  } catch (err) {
    return next(err)
  }
}

export async function signin(req, res, next) {
  try {
    const { email = '', password = '' } = req.body
    if (!emailRegex.test(email) || !password) throw createError('Input tidak valid.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
    const user = rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw createError('Email atau password salah.', 401)
    }

    if (user.status !== 'active') throw createError('Akun belum aktif atau diblokir.', 403)

    await createOtp({ userId: user.id, email: user.email, purpose: 'signin' })
    return res.json({ message: 'OTP login telah dikirim.' })
  } catch (err) {
    return next(err)
  }
}

export async function verifySignin(req, res, next) {
  try {
    const { email = '', otp = '' } = req.body
    if (!emailRegex.test(email) || !/^\d{6}$/.test(otp)) throw createError('Email/OTP tidak valid.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
    const user = rows[0]
    if (!user) throw createError('User tidak ditemukan.', 404)

    await verifyOtpRecord({ userId: user.id, email: user.email, purpose: 'signin', otp })
    await issueSession(user, req, res)
    return res.json({ token: issueAccessToken(user), user: publicUser(user) })
  } catch (err) {
    return next(err)
  }
}

export async function resendOtp(req, res, next) {
  try {
    const { email = '', purpose = 'signup' } = req.body
    if (!emailRegex.test(email) || !purposeMap.has(purpose)) throw createError('Input tidak valid.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
    const user = rows[0]
    if (!user) throw createError('User tidak ditemukan.', 404)

    await createOtp({ userId: user.id, email: user.email, purpose })
    return res.json({ message: 'OTP baru telah dikirim.' })
  } catch (err) {
    return next(err)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email = '' } = req.body
    if (!emailRegex.test(email)) throw createError('Email tidak valid.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
    const user = rows[0]
    if (user) await createOtp({ userId: user.id, email: user.email, purpose: 'reset_password' })

    return res.json({ message: 'Jika email terdaftar, OTP reset akan dikirim.' })
  } catch (err) {
    return next(err)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email = '', otp = '', password = '', confirmPassword = '' } = req.body
    if (!emailRegex.test(email) || !/^\d{6}$/.test(otp) || password.length < 8 || password !== confirmPassword) {
      throw createError('Input reset password tidak valid.', 400)
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email.trim().toLowerCase()])
    const user = rows[0]
    if (!user) throw createError('User tidak ditemukan.', 404)

    await verifyOtpRecord({ userId: user.id, email: user.email, purpose: 'reset_password', otp })
    await pool.query('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(password, 12), user.id])

    return res.json({ message: 'Password berhasil direset.' })
  } catch (err) {
    return next(err)
  }
}

export async function logout(req, res, next) {
  try {
    const token = getCookie(req, 'refresh_token')
    if (token) await pool.query('DELETE FROM sessions WHERE refresh_token_hash=?', [sha256(token)])

    res.clearCookie('refresh_token')
    return res.json({ message: 'Logout berhasil.' })
  } catch (err) {
    return next(err)
  }
}

export async function me(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id=? LIMIT 1', [req.user.id])
    const user = rows[0]
    if (!user) throw createError('User tidak ditemukan.', 404)

    return res.json({ user: publicUser(user) })
  } catch (err) {
    return next(err)
  }
}
