import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { pool } from '../config/db.js'

const OTP_EXPIRY_MINUTES = 10
const MAX_OTP_ATTEMPTS = 5
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m'
const JWT_REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 7)

const ALLOWED_PURPOSES = new Set(['signup', 'signin', 'reset_password'])
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const jwtSecret = () => process.env.JWT_SECRET || 'super-secret'
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function createError(message, statusCode = 500) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function debugLog(step, payload = {}) {
  console.log(`[AUTH][${step}]`, payload)
}

function issueAccessToken(user) {
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret(), { expiresIn: JWT_ACCESS_EXPIRES })
  debugLog('JWT_GENERATED', { userId: user.id, expiresIn: JWT_ACCESS_EXPIRES })
  return token
}

function buildPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    role: user.role,
    emailVerifiedAt: user.email_verified_at,
  }
}

function setRefreshCookie(res, refreshToken) {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: String(process.env.COOKIE_SECURE || 'false') === 'true',
    maxAge: JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  })
}

function generateOtp6Digits() {
  return String(crypto.randomInt(100000, 1000000))
}

async function sendOtpEmail(email, otp, purpose) {
  const purposeLabel = {
    signup: 'Verifikasi Sign Up',
    signin: 'Verifikasi Sign In',
    reset_password: 'Reset Password',
  }[purpose]

  debugLog('SEND_OTP_EMAIL_START', { email, purpose })

  const info = await mailer.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `[SIIntern] OTP ${purposeLabel}`,
    text: `Kode OTP Anda: ${otp}. Berlaku ${OTP_EXPIRY_MINUTES} menit.`,
  })

  debugLog('SEND_OTP_EMAIL_SUCCESS', { messageId: info.messageId, email, purpose })
}

async function createOtpRecordAndSendMail({ userId, email, purpose }) {
  const otpPlain = generateOtp6Digits()
  const otpHash = await bcrypt.hash(otpPlain, 10)

  console.log('OTP yang dikirim:', { email, purpose, otp: otpPlain })
  debugLog('CREATE_OTP_HASHED', { userId, email, purpose })

  const [result] = await pool.query(
    `INSERT INTO email_otps (user_id, email, purpose, otp_hash, expires_at, attempts)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0)`,
    [userId, email, purpose, otpHash, OTP_EXPIRY_MINUTES],
  )

  debugLog('DB_INSERT_EMAIL_OTP', { otpId: result.insertId, userId, purpose })
  await sendOtpEmail(email, otpPlain, purpose)
}

async function verifyOtpOrThrow({ userId, email, purpose, otpInput }) {
  const [rows] = await pool.query(
    `SELECT * FROM email_otps
     WHERE user_id = ? AND email = ? AND purpose = ? AND used_at IS NULL
     ORDER BY id DESC
     LIMIT 1`,
    [userId, email, purpose],
  )

  debugLog('DB_SELECT_OTP', { found: rows.length > 0, userId, purpose })

  const otpRow = rows[0]
  if (!otpRow) throw createError('OTP tidak ditemukan.', 400)
  if (otpRow.attempts >= MAX_OTP_ATTEMPTS) throw createError('OTP melebihi batas percobaan (5x).', 429)
  if (new Date(otpRow.expires_at) < new Date()) throw createError('OTP sudah kadaluarsa (10 menit).', 400)

  const match = await bcrypt.compare(otpInput, otpRow.otp_hash)
  debugLog('OTP_COMPARE_RESULT', { otpId: otpRow.id, match })

  if (!match) {
    await pool.query('UPDATE email_otps SET attempts = attempts + 1 WHERE id = ?', [otpRow.id])
    throw createError('OTP salah.', 400)
  }

  await pool.query('UPDATE email_otps SET used_at = NOW() WHERE id = ?', [otpRow.id])
  debugLog('OTP_MARKED_USED', { otpId: otpRow.id })
}

async function createSession(user, req, res) {
  const refreshTokenPlain = crypto.randomBytes(48).toString('hex')
  const refreshTokenHash = sha256(refreshTokenPlain)

  const [result] = await pool.query(
    `INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [user.id, refreshTokenHash, req.headers['user-agent'] || 'unknown', req.ip, JWT_REFRESH_EXPIRES_DAYS],
  )

  debugLog('DB_INSERT_SESSION', { sessionId: result.insertId, userId: user.id })
  setRefreshCookie(res, refreshTokenPlain)
}

export async function signup(req, res, next) {
  try {
    console.log('payload register:', req.body)
    const { name = '', email = '', password = '', confirmPassword = '' } = req.body
    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedName) throw createError('Nama wajib diisi.', 400)
    if (!EMAIL_REGEX.test(normalizedEmail)) throw createError('Format email tidak valid.', 400)
    if (password.length < 8) throw createError('Password minimal 8 karakter.', 400)
    if (password !== confirmPassword) throw createError('Konfirmasi password tidak cocok.', 400)

    const [existingRows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail])
    debugLog('DB_SELECT_USER_BY_EMAIL', { email: normalizedEmail, found: existingRows.length > 0 })
    if (existingRows.length) throw createError('Email sudah terdaftar.', 409)

    const passwordHash = await bcrypt.hash(password, 12)
    const [insertResult] = await pool.query(
      `INSERT INTO users (name, email, password_hash, status, role)
       VALUES (?, ?, ?, 'pending', 'student')`,
      [normalizedName, normalizedEmail, passwordHash],
    )
    debugLog('DB_INSERT_USER', { userId: insertResult.insertId, email: normalizedEmail })

    await createOtpRecordAndSendMail({ userId: insertResult.insertId, email: normalizedEmail, purpose: 'signup' })
    return res.status(201).json({ message: 'Registrasi berhasil. OTP telah dikirim ke email.' })
  } catch (error) {
    console.error('Register error detail:', error)
    return next(error)
  }
}

export async function verifySignup(req, res, next) {
  try {
    const { email = '', otp = '' } = req.body
    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail)) throw createError('Format email tidak valid.', 400)
    if (!/^\d{6}$/.test(otp)) throw createError('OTP harus 6 digit angka.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail])
    const user = rows[0]
    if (!user) throw createError('Email tidak ditemukan.', 404)

    await verifyOtpOrThrow({ userId: user.id, email: user.email, purpose: 'signup', otpInput: otp })
    await pool.query(`UPDATE users SET status = 'active', email_verified_at = NOW() WHERE id = ?`, [user.id])
    return res.json({ message: 'Verifikasi email berhasil. Akun aktif.' })
  } catch (error) {
    return next(error)
  }
}

export async function signin(req, res, next) {
  try {
    console.log('payload login:', req.body)
    const { email = '', password = '' } = req.body
    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail)) throw createError('Format email tidak valid.', 400)
    if (!password) throw createError('Password wajib diisi.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail])
    const user = rows[0]
    if (!user) throw createError('Email tidak ditemukan.', 404)

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) throw createError('Password salah.', 401)
    if (user.status !== 'active') throw createError('Akun belum aktif atau diblokir.', 403)

    await createOtpRecordAndSendMail({ userId: user.id, email: user.email, purpose: 'signin' })
    return res.json({ message: 'OTP login telah dikirim ke email.' })
  } catch (error) {
    console.error('Login error detail:', error)
    return next(error)
  }
}

export async function verifySignin(req, res, next) {
  try {
    const { email = '', otp = '' } = req.body
    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail)) throw createError('Format email tidak valid.', 400)
    if (!/^\d{6}$/.test(otp)) throw createError('OTP harus 6 digit angka.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail])
    const user = rows[0]
    if (!user) throw createError('Email tidak ditemukan.', 404)

    await verifyOtpOrThrow({ userId: user.id, email: user.email, purpose: 'signin', otpInput: otp })

    const accessToken = issueAccessToken(user)
    await createSession(user, req, res)

    return res.json({
      message: 'Login berhasil.',
      token: accessToken,
      user: buildPublicUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

export async function resendOtp(req, res, next) {
  try {
    const { email = '', purpose = 'signup' } = req.body
    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail)) throw createError('Format email tidak valid.', 400)
    if (!ALLOWED_PURPOSES.has(purpose)) throw createError('Purpose OTP tidak valid.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail])
    const user = rows[0]
    if (!user) throw createError('Email tidak ditemukan.', 404)

    await createOtpRecordAndSendMail({ userId: user.id, email: user.email, purpose })
    return res.json({ message: 'OTP baru telah dikirim.' })
  } catch (error) {
    return next(error)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email = '' } = req.body
    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail)) throw createError('Format email tidak valid.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail])
    const user = rows[0]
    if (user) await createOtpRecordAndSendMail({ userId: user.id, email: user.email, purpose: 'reset_password' })

    return res.json({ message: 'Jika email terdaftar, OTP reset telah dikirim.' })
  } catch (error) {
    return next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email = '', otp = '', password = '', confirmPassword = '' } = req.body
    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail)) throw createError('Format email tidak valid.', 400)
    if (!/^\d{6}$/.test(otp)) throw createError('OTP harus 6 digit angka.', 400)
    if (password.length < 8) throw createError('Password minimal 8 karakter.', 400)
    if (password !== confirmPassword) throw createError('Konfirmasi password tidak cocok.', 400)

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail])
    const user = rows[0]
    if (!user) throw createError('Email tidak ditemukan.', 404)

    await verifyOtpOrThrow({ userId: user.id, email: user.email, purpose: 'reset_password', otpInput: otp })

    const newHash = await bcrypt.hash(password, 12)
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id])
    return res.json({ message: 'Password berhasil diperbarui.' })
  } catch (error) {
    return next(error)
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refresh_token || null

    if (refreshToken) {
      const refreshHash = sha256(refreshToken)
      await pool.query('DELETE FROM sessions WHERE refresh_token_hash = ?', [refreshHash])
    }

    res.clearCookie('refresh_token')
    return res.json({ message: 'Logout berhasil.' })
  } catch (error) {
    return next(error)
  }
}

export async function me(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.user.id])
    const user = rows[0]
    if (!user) throw createError('User tidak ditemukan.', 404)

    return res.json({ user: buildPublicUser(user) })
  } catch (error) {
    return next(error)
  }
}

// Legacy alias: gunakan endpoint /signin untuk login
export const login = signin
export const verifyLogin = verifySignin
