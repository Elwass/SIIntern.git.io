import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clearSession,
  getDashboardPath,
  getStoredSession,
  loginUser,
  persistSession,
  registerUser,
  validateLoginForm,
  validateRegisterForm,
} from '../auth.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  }
}

test.beforeEach(() => {
  global.localStorage = createStorage()
  global.sessionStorage = createStorage()
})

test('login success calls backend and returns token payload', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, '/api/auth/login')
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), {
      email: 'student@dprd.go.id',
      password: 'student123',
    })
    return new Response(JSON.stringify({ token: 'jwt-token', role: 'Student' }), { status: 200 })
  }

  const result = await loginUser({ email: 'student@dprd.go.id', password: 'student123' })
  assert.equal(result.token, 'jwt-token')
  assert.equal(getDashboardPath(result.role), '/student')
})

test('login gagal exposes clear backend error message', async () => {
  global.fetch = async () => new Response(JSON.stringify({ message: 'Email atau password salah.' }), { status: 401 })

  await assert.rejects(
    loginUser({ email: 'wrong@example.com', password: 'badpass' }),
    /Email atau password salah\./,
  )
})

test('register success calls backend register endpoint', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, '/api/auth/register')
    assert.deepEqual(JSON.parse(options.body), {
      name: 'Siti Student',
      email: 'siti@example.com',
      password: 'secret123',
    })
    return new Response(JSON.stringify({ token: 'new-token', role: 'Student' }), { status: 201 })
  }

  const result = await registerUser({ name: 'Siti Student', email: 'siti@example.com', password: 'secret123' })
  assert.equal(result.token, 'new-token')
})

test('form validations reject invalid email, short password, and mismatched confirmation', () => {
  assert.deepEqual(validateLoginForm({ email: 'not-email', password: '' }), {
    email: 'Format email tidak valid.',
    password: 'Password wajib diisi.',
  })

  assert.deepEqual(
    validateRegisterForm({ name: '', email: 'user@example.com', password: '123', confirmPassword: '456' }),
    {
      name: 'Nama wajib diisi.',
      password: 'Password minimal 6 karakter.',
      confirmPassword: 'Konfirmasi password harus sama.',
    },
  )
})

test('remember me controls session persistence location', () => {
  persistSession({ token: 'session-token', role: 'Student' }, false)
  assert.equal(sessionStorage.getItem('siintern.auth') !== null, true)
  assert.equal(localStorage.getItem('siintern.auth'), null)
  assert.equal(getStoredSession().token, 'session-token')

  persistSession({ token: 'remember-token', role: 'Admin' }, true)
  assert.equal(localStorage.getItem('siintern.auth') !== null, true)
  assert.equal(sessionStorage.getItem('siintern.auth'), null)
  assert.equal(getStoredSession().role, 'Admin')

  clearSession()
  assert.equal(getStoredSession(), null)
})
