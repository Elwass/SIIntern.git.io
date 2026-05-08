import assert from 'node:assert/strict'
import test from 'node:test'
import { login, register } from '../authController.js'

function createResponse() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
  }
}

test('login success issues token and public user payload', async () => {
  const res = createResponse()
  await login({ body: { email: 'student@dprd.go.id', password: 'student123' } }, res)

  assert.equal(res.statusCode, 200)
  assert.equal(typeof res.payload.token, 'string')
  assert.equal(res.payload.role, 'student')
  assert.equal(res.payload.user.email, 'student@dprd.go.id')
  assert.equal(res.payload.user.password, undefined)
})

test('login gagal returns 401 with clear message', async () => {
  const res = createResponse()
  await login({ body: { email: 'student@dprd.go.id', password: 'wrong' } }, res)

  assert.equal(res.statusCode, 401)
  assert.equal(res.payload.message, 'Email atau password salah.')
})

test('register success creates student and returns usable token', async () => {
  const email = `new-${Date.now()}@example.com`
  const res = createResponse()

  await register({ body: { name: 'Mahasiswa Baru', email, password: 'secret123' } }, res)

  assert.equal(res.statusCode, 201)
  assert.equal(typeof res.payload.token, 'string')
  assert.equal(res.payload.role, 'student')
  assert.equal(res.payload.user.name, 'Mahasiswa Baru')
  assert.equal(res.payload.user.email, email)
})
