const SESSION_KEY = 'siintern.auth'

export const roleRedirectMap = {
  admin: '/admin',
  pembimbing_lapangan: '/admin',
  mentor: '/mentor',
  student: '/student',
}

export function getStoredSession() {
  const rawSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
  if (!rawSession) return null

  try {
    const session = JSON.parse(rawSession)
    return session?.token ? session : null
  } catch {
    clearSession()
    return null
  }
}

export function persistSession(session, rememberMe = false) {
  const storage = rememberMe ? localStorage : sessionStorage
  const otherStorage = rememberMe ? sessionStorage : localStorage
  otherStorage.removeItem(SESSION_KEY)
  storage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function getAuthHeader() {
  const session = getStoredSession()
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {}
}

export function getDashboardPath(role) {
  return roleRedirectMap[role?.toLowerCase()] || '/student'
}

async function parseJson(response) {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

async function requestAuth(endpoint, payload) {
  const response = await fetch(`/api/auth/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await parseJson(response)

  if (!response.ok) {
    throw new Error(result.message || 'Permintaan autentikasi gagal. Silakan coba lagi.')
  }

  return result
}

export function loginUser({ email, password }) {
  return requestAuth('login', { email, password })
}

export function registerUser({ name, email, password }) {
  return requestAuth('register', { name, email, password })
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateLoginForm({ email, password }) {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Email wajib diisi.'
  } else if (!validateEmail(email)) {
    errors.email = 'Format email tidak valid.'
  }

  if (!password) {
    errors.password = 'Password wajib diisi.'
  }

  return errors
}

export function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errors = validateLoginForm({ email, password })

  if (!name.trim()) {
    errors.name = 'Nama wajib diisi.'
  }

  if (password && password.length < 6) {
    errors.password = 'Password minimal 6 karakter.'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi.'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password harus sama.'
  }

  return errors
}
