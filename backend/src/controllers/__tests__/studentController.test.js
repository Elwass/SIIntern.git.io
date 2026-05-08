import assert from 'node:assert/strict'
import test from 'node:test'
import { getStudentDashboard, createStudentApplication } from '../studentController.js'

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
    send() {
      return this
    },
  }
}

test('student dashboard uses authenticated student data and internship domain fields', () => {
  const res = createResponse()

  getStudentDashboard({ user: { id: 3, role: 'student' }, query: {}, params: {} }, res)

  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.profile.name, 'Mahasiswa Demo')
  assert.equal(res.payload.application.field, 'Sistem Informasi dan Teknologi')
  assert.equal(res.payload.documents.missing.includes('Transkrip Nilai'), true)
  assert.equal(res.payload.aiAssistant.message, 'Ringkasan AI akan tersedia setelah logbook mencukupi.')
})

test('new student dashboard returns clear empty application and logbook states', () => {
  const res = createResponse()

  getStudentDashboard({ user: { id: 4, role: 'student' }, query: {}, params: {} }, res)

  assert.equal(res.payload.profile.profileStatus, 'Belum Lengkap')
  assert.equal(res.payload.application.status, 'Belum Mengajukan')
  assert.equal(res.payload.logbooks.summary.status, 'Belum Ada Logbook')
})

test('mentor cannot access a student outside assignment', () => {
  const res = createResponse()

  getStudentDashboard({ user: { id: 2, role: 'mentor' }, query: { studentId: 4 }, params: {} }, res)

  assert.equal(res.statusCode, 403)
  assert.match(res.payload.message, /peran pengguna/)
})

test('student application validates official internship fields', () => {
  const res = createResponse()

  createStudentApplication(
    { user: { id: 4, role: 'student' }, query: {}, params: {}, body: { field: 'Bidang Tidak Ada', period: 'Juli 2026' } },
    res,
  )

  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.message, 'Bidang magang tidak valid.')
})
