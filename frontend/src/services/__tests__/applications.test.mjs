import assert from 'node:assert/strict'
import test from 'node:test'
import { clearSession, persistSession } from '../auth.js'
import {
  createStudentApplication,
  getCurrentStudentApplication,
  submitStudentApplication,
  uploadStudentDocument,
  updateAdminApplicationStatus,
} from '../applications.js'

function createStorage() {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}

test.beforeEach(() => {
  global.localStorage = createStorage()
  global.sessionStorage = createStorage()
  persistSession({ token: 'token', role: 'student' }, true)
})

test.afterEach(() => clearSession())

test('student application API helpers call real application endpoints with auth header', async () => {
  const calls = []
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options })
    assert.equal(options.headers.Authorization, 'Bearer token')
    return new Response(JSON.stringify({ id: 10, status: 'draft' }), { status: 200 })
  }

  await getCurrentStudentApplication()
  await createStudentApplication({ namaLengkap: 'Mahasiswa' })
  await uploadStudentDocument(10, { jenisDokumen: 'Curriculum Vitae', fileName: 'cv.pdf' })
  await submitStudentApplication(10)

  assert.deepEqual(calls.map((call) => call.url), [
    '/api/student/applications/current',
    '/api/student/applications',
    '/api/student/applications/10/documents',
    '/api/student/applications/10/submit',
  ])
})

test('admin status helper sends PATCH request to admin endpoint', async () => {
  global.fetch = async (url, options = {}) => {
    assert.equal(url, '/api/admin/applications/1/status')
    assert.equal(options.method, 'PATCH')
    assert.deepEqual(JSON.parse(options.body), { status: 'verified', catatanAdmin: 'Lengkap' })
    return new Response(JSON.stringify({ id: 1, status: 'verified' }), { status: 200 })
  }

  const result = await updateAdminApplicationStatus(1, { status: 'verified', catatanAdmin: 'Lengkap' })
  assert.equal(result.status, 'verified')
})
