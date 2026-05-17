import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as defaultUsers from '../repositories/userRepository.js'

const DEFAULT_TOKEN_EXPIRY = '8h'
const jwtSecret = () => process.env.JWT_SECRET || 'siintern-development-secret'
let users = defaultUsers

export function setUserRepositoryForTests(repository) {
  users = repository || defaultUsers
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

// Set refresh token pada cookie httpOnly
function setRefreshCookie(res, refreshToken) {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: String(process.env.COOKIE_SECURE || 'false') === 'true',
    maxAge: JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  })
}

// Membuat OTP 6 digit
function generateOtp6Digits() {
  return String(crypto.randomInt(100000, 1000000))
}

// Kirim OTP asli ke email user via SMTP
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

// Simpan OTP ter-hash ke DB, lalu kirim OTP ke email
async function createOtpRecordAndSendMail({ userId, email, purpose }) {
  const otpPlain = generateOtp6Digits()
  const otpHash = await bcrypt.hash(otpPlain, 10)

  debugLog('CREATE_OTP_HASHED', { userId, email, purpose })

  const [result] = await pool.query(
    `INSERT INTO email_otps (user_id, email, purpose, otp_hash, expires_at, attempts)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0)`,
    [userId, email, purpose, otpHash, OTP_EXPIRY_MINUTES],
  )

  debugLog('DB_INSERT_EMAIL_OTP', { otpId: result.insertId, userId, purpose })
  await sendOtpEmail(email, otpPlain, purpose)
}

// Verifikasi OTP aktif terbaru untuk user+purpose
async function verifyOtpOrThrow({ userId, email, purpose, otpInput }) {
  const [rows] = await pool.query(
    `SELECT * FROM email_otps
     WHERE user_id = ? AND email = ? AND purpose = ? AND used_at IS NULL
     ORDER BY id DESC
     LIMIT 1`,
    [userId, email, purpose],
  )

  debugLog('DB_SELECT_OTP', { found: rows.length > 0, userId, purpose })

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
