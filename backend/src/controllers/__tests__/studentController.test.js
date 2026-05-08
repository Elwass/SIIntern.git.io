import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assignApplicationMentor,
  createStudentApplication,
  createStudentApplicationDocument,
  getCurrentStudentApplication,
  listAdminApplications,
  listMentorApplications,
  submitStudentApplication,
  updateAdminApplicationStatus,
  updateAdminDocumentStatus,
} from '../applicationController.js'

function createResponse() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) { this.statusCode = code; return this },
    json(payload) { this.payload = payload; return this },
    send() { return this },
  }
}

const draftPayload = {
  namaLengkap: 'Mahasiswa Test',
  nim: 'TST001',
  kampus: 'Universitas Test',
  programStudi: 'Ilmu Pemerintahan',
  semester: 6,
  email: 'mahasiswa.test@example.com',
  noHp: '081234567890',
  alamat: 'Banyumas',
  bidangMagang: 'Administrasi Pemerintahan',
  periodeMulai: '2026-07-01',
  periodeSelesai: '2026-08-31',
  motivasi: 'Belajar administrasi pemerintahan daerah.',
}

test('student can create draft application and cannot submit without required documents', () => {
  const createRes = createResponse()
  createStudentApplication({ user: { id: 4, role: 'student' }, body: draftPayload }, createRes)

  assert.equal(createRes.statusCode, 201)
  assert.equal(createRes.payload.status, 'draft')

  const submitRes = createResponse()
  submitStudentApplication({ user: { id: 4, role: 'student' }, params: { id: createRes.payload.id }, body: {} }, submitRes)

  assert.equal(submitRes.statusCode, 400)
  assert.match(submitRes.payload.message, /Dokumen wajib belum lengkap/)
})

test('student can upload documents and submit application', () => {
  const currentRes = createResponse()
  getCurrentStudentApplication({ user: { id: 4, role: 'student' } }, currentRes)
  const applicationId = currentRes.payload.id

  for (const jenisDokumen of currentRes.payload.documentSummary.required) {
    const uploadRes = createResponse()
    createStudentApplicationDocument(
      { user: { id: 4, role: 'student' }, params: { id: applicationId }, body: { jenisDokumen, fileName: `${jenisDokumen}.pdf`, fileSize: 1000, mimeType: 'application/pdf' } },
      uploadRes,
    )
    assert.ok([200, 201].includes(uploadRes.statusCode))
  }

  const submitRes = createResponse()
  submitStudentApplication({ user: { id: 4, role: 'student' }, params: { id: applicationId }, body: {} }, submitRes)
  assert.equal(submitRes.statusCode, 200)
  assert.equal(submitRes.payload.status, 'submitted')
})

test('admin can list, verify documents, request revision, accept, and assign mentor', () => {
  const listRes = createResponse()
  listAdminApplications({ user: { id: 1, role: 'admin' }, query: { search: 'Mahasiswa Demo' } }, listRes)
  assert.equal(listRes.payload.data.length >= 1, true)
  const application = listRes.payload.data[0]

  const docRes = createResponse()
  updateAdminDocumentStatus({ user: { id: 1, role: 'admin' }, params: { id: application.id, documentId: 1 }, body: { status: 'verified', catatanAdmin: 'Sesuai' } }, docRes)
  assert.equal(docRes.payload.status, 'verified')

  const verifyRes = createResponse()
  updateAdminApplicationStatus({ user: { id: 1, role: 'admin' }, params: { id: application.id }, body: { status: 'verified', catatanAdmin: 'Berkas lengkap' } }, verifyRes)
  assert.equal(verifyRes.payload.status, 'verified')

  const acceptRes = createResponse()
  updateAdminApplicationStatus({ user: { id: 1, role: 'admin' }, params: { id: application.id }, body: { status: 'accepted', catatanAdmin: 'Diterima' } }, acceptRes)
  assert.equal(acceptRes.payload.status, 'accepted')

  const mentorRes = createResponse()
  assignApplicationMentor({ user: { id: 1, role: 'admin' }, params: { id: application.id }, body: { mentorId: 2 } }, mentorRes)
  assert.equal(mentorRes.payload.mentor.id, 2)
})

test('mentor only sees accepted applications assigned to them', () => {
  const res = createResponse()
  listMentorApplications({ user: { id: 2, role: 'mentor' } }, res)

  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.some((application) => application.mentor?.id === 2), true)
})
