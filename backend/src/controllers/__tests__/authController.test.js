import assert from 'node:assert/strict'
import test from 'node:test'
import bcrypt from 'bcryptjs'
import { login, register, setUserRepositoryForTests } from '../authController.js'

function createResponse() {
  return { statusCode: 200, payload: undefined, status(code) { this.statusCode = code; return this }, json(payload) { this.payload = payload; return this } }
}

function createUserRepo() {
  const users = [{ id: 10, name: 'Mahasiswa Test', email: 'student@example.com', passwordHash: bcrypt.hashSync('student123', 10), role: 'student' }]
  return {
    findUserByEmail: async (email) => users.find((user) => user.email === email) || null,
    findUserById: async (id) => users.find((user) => user.id === id) || null,
    createUser: async (payload) => { const user = { id: users.length + 20, ...payload }; users.push(user); return user },
  }
}

test.beforeEach(() => setUserRepositoryForTests(createUserRepo()))

test('login success issues token and public user payload from repository', async () => {
  const res = createResponse()
  await login({ body: { email: 'student@example.com', password: 'student123' } }, res)
  assert.equal(res.statusCode, 200)
  assert.equal(typeof res.payload.token, 'string')
  assert.equal(res.payload.role, 'student')
  assert.equal(res.payload.user.email, 'student@example.com')
  assert.equal(res.payload.user.passwordHash, undefined)
})

test('login gagal returns 401 with clear message', async () => {
  const res = createResponse()
  await login({ body: { email: 'student@example.com', password: 'wrong' } }, res)
  assert.equal(res.statusCode, 401)
  assert.equal(res.payload.message, 'Email atau password salah.')
})

test('register success creates student and returns usable token', async () => {
  const res = createResponse()
  await register({ body: { name: 'Mahasiswa Baru', email: 'new.student@example.com', password: 'secret123' } }, res)
  assert.equal(res.statusCode, 201)
  assert.equal(typeof res.payload.token, 'string')
  assert.equal(res.payload.role, 'student')
  assert.equal(res.payload.user.name, 'Mahasiswa Baru')
  assert.equal(res.payload.user.email, 'new.student@example.com')
})
