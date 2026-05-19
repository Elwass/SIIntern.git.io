import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assignApplicationMentor,
  createStudentApplication,
  createStudentApplicationDocument,
  getCurrentStudentApplication,
  listAdminApplications,
  listMentorApplications,
  setApplicationRepositoriesForTests,
  submitStudentApplication,
  updateAdminApplicationStatus,
  updateAdminDocumentStatus,
} from '../applicationController.js'

function createResponse() {
  return { statusCode: 200, payload: undefined, status(code) { this.statusCode = code; return this }, json(payload) { this.payload = payload; return this }, send() { return this } }
}

const registrationPayload = {
  namaLengkap: 'Mahasiswa Test', nim: 'TST001', kampus: 'Universitas Test', programStudi: 'Ilmu Pemerintahan', semester: 6,
  email: 'mahasiswa.test@example.com', noHp: '081234567890', alamat: 'Banyumas', bidangMagang: 'Administrasi Pemerintahan',
  periodeMulai: '2026-07-01', periodeSelesai: '2026-08-31', motivasi: 'Belajar administrasi pemerintahan daerah.',
}

function createRepositories() {
  const profiles = []
  const applications = []
  const documents = []
  const mentors = [{ id: 2, name: 'Mentor Test', email: 'mentor@example.com', role: 'mentor' }]
  return {
    applications: {
      getStudentProfile: async (userId) => profiles.find((profile) => profile.userId === userId) || null,
      upsertStudentProfile: async (userId, payload) => {
        let profile = profiles.find((item) => item.userId === userId)
        if (!profile) { profile = { id: profiles.length + 1, userId }; profiles.push(profile) }
        Object.assign(profile, payload)
        return profile
      },
      getCurrentApplication: async (userId) => applications.find((application) => application.userId === userId) || null,
      getApplicationById: async (id) => applications.find((application) => application.id === Number(id)) || null,
      createApplication: async (userId, payload) => { const application = { id: applications.length + 1, userId, ...payload, status: 'pending', catatanAdmin: '', mentorId: null }; applications.push(application); return application },
      updateApplication: async (id, payload) => { const application = applications.find((item) => item.id === Number(id)); Object.assign(application, payload); return application },
      setApplicationStatus: async (id, status, catatanAdmin = '') => { const application = applications.find((item) => item.id === Number(id)); Object.assign(application, { status, catatanAdmin }); return application },
      setApplicationMentor: async (id, mentorId) => { const application = applications.find((item) => item.id === Number(id)); application.mentorId = mentorId; return application },
      upsertMentorAssignment: async () => {},
      listDocuments: async (applicationId) => documents.filter((document) => document.applicationId === Number(applicationId)),
      upsertDocument: async (payload) => { let document = documents.find((item) => item.applicationId === payload.applicationId && item.jenisDokumen === payload.jenisDokumen); if (!document) { document = { id: documents.length + 1 }; documents.push(document) } Object.assign(document, payload, { status: 'uploaded' }); return document },
      deleteDocument: async () => null,
      updateDocumentStatus: async (applicationId, documentId, status, catatanAdmin) => { const document = documents.find((item) => item.applicationId === Number(applicationId) && item.id === Number(documentId)); if (!document) return null; Object.assign(document, { status, catatanAdmin }); return document },
      listAdminApplications: async ({ search = '' }) => ({ data: applications.filter((application) => !search || profiles.find((profile) => profile.userId === application.userId)?.namaLengkap.includes(search)).map((application) => ({ ...application, ...profiles.find((profile) => profile.userId === application.userId) })), total: applications.length }),
      getApplicationDetail: async (id) => { const application = applications.find((item) => item.id === Number(id)); if (!application) return null; return { application, profile: profiles.find((profile) => profile.userId === application.userId), user: { id: application.userId, email: 'student@example.com', role: 'student' }, mentor: mentors.find((mentor) => mentor.id === application.mentorId) || null, documents: documents.filter((document) => document.applicationId === application.id) } },
      listMentorApplications: async (mentorId) => applications.filter((application) => application.mentorId === mentorId && application.status === 'accepted').map((application) => ({ ...application, ...profiles.find((profile) => profile.userId === application.userId), mentor: mentors.find((mentor) => mentor.id === application.mentorId) })),
      createNotification: async () => {},
    },
    users: { findUserById: async (id) => mentors.find((mentor) => mentor.id === id) || null, listMentors: async () => mentors },
  }
}

test.beforeEach(() => setApplicationRepositoriesForTests(createRepositories()))

test('student baru membuka pendaftaran gets empty state from repository', async () => {
  const res = createResponse()
  await getCurrentStudentApplication({ user: { id: 4, role: 'student', email: 'student@example.com' } }, res)
  assert.deepEqual(res.payload.application, null)
  assert.deepEqual(res.payload.profile, null)
  assert.deepEqual(res.payload.documents, [])
})

test('student can register internship and refresh submitted application from repository', async () => {
  const createRes = createResponse()
  await createStudentApplication({ user: { id: 4, role: 'student', email: 'student@example.com' }, body: registrationPayload }, createRes)
  assert.equal(createRes.statusCode, 201)
  assert.equal(createRes.payload.application.status, 'pending')
  const refreshRes = createResponse()
  await getCurrentStudentApplication({ user: { id: 4, role: 'student', email: 'student@example.com' } }, refreshRes)
  assert.equal(refreshRes.payload.profile.namaLengkap, 'Mahasiswa Test')
  assert.equal(refreshRes.payload.application.bidangMagang, 'Administrasi Pemerintahan')
})

test('student cannot submit without required documents', async () => {
  const createRes = createResponse()
  await createStudentApplication({ user: { id: 4, role: 'student', email: 'student@example.com' }, body: registrationPayload }, createRes)
  const submitRes = createResponse()
  await submitStudentApplication({ user: { id: 4, role: 'student' }, params: { id: createRes.payload.application.id }, body: {} }, submitRes)
  assert.equal(submitRes.statusCode, 400)
  assert.match(submitRes.payload.message, /Dokumen wajib belum lengkap/)
})

test('student uploads required documents and submits application', async () => {
  const createRes = createResponse()
  await createStudentApplication({ user: { id: 4, role: 'student', email: 'student@example.com' }, body: registrationPayload }, createRes)
  const applicationId = createRes.payload.application.id
  for (const jenisDokumen of createRes.payload.documentSummary.required) {
    const uploadRes = createResponse()
    await createStudentApplicationDocument({ user: { id: 4, role: 'student' }, params: { id: applicationId }, body: { jenisDokumen, fileName: `${jenisDokumen}.pdf`, fileSize: 1000, mimeType: 'application/pdf' } }, uploadRes)
    assert.equal(uploadRes.statusCode, 201)
  }
  const submitRes = createResponse()
  await submitStudentApplication({ user: { id: 4, role: 'student' }, params: { id: applicationId }, body: {} }, submitRes)
  assert.equal(submitRes.payload.application.status, 'pending')
})

test('admin can reject with optional notes from pending status', async () => {
  const createRes = createResponse()
  await createStudentApplication({ user: { id: 4, role: 'student', email: 'student@example.com' }, body: registrationPayload }, createRes)
  const applicationId = createRes.payload.application.id
  const rejected = createResponse()
  await updateAdminApplicationStatus({ user: { id: 1, role: 'admin' }, params: { id: applicationId }, body: { status: 'rejected', catatanAdmin: 'Dokumen belum sesuai' } }, rejected)
  assert.equal(rejected.payload.application.status, 'rejected')
  assert.equal(rejected.payload.application.catatanAdmin, 'Dokumen belum sesuai')
})

test('admin can verify, accept, and assign mentor so mentor sees student', async () => {
  const createRes = createResponse()
  await createStudentApplication({ user: { id: 4, role: 'student', email: 'student@example.com' }, body: registrationPayload }, createRes)
  const applicationId = createRes.payload.application.id
  for (const jenisDokumen of createRes.payload.documentSummary.required) {
    await createStudentApplicationDocument({ user: { id: 4, role: 'student' }, params: { id: applicationId }, body: { jenisDokumen, fileName: `${jenisDokumen}.pdf`, fileSize: 1000, mimeType: 'application/pdf' } }, createResponse())
  }
  await submitStudentApplication({ user: { id: 4, role: 'student' }, params: { id: applicationId }, body: {} }, createResponse())
  const adminList = createResponse()
  await listAdminApplications({ user: { id: 1, role: 'admin' }, query: { search: 'Mahasiswa Test' } }, adminList)
  assert.equal(adminList.payload.data.length, 1)
  await updateAdminApplicationStatus({ user: { id: 1, role: 'admin' }, params: { id: applicationId }, body: { status: 'verified' } }, createResponse())
  const accepted = createResponse()
  await updateAdminApplicationStatus({ user: { id: 1, role: 'admin' }, params: { id: applicationId }, body: { status: 'accepted' } }, accepted)
  assert.equal(accepted.payload.application.status, 'accepted')
  const assigned = createResponse()
  await assignApplicationMentor({ user: { id: 1, role: 'admin' }, params: { id: applicationId }, body: { mentorId: 2 } }, assigned)
  assert.equal(assigned.payload.mentor.id, 2)
  const mentorList = createResponse()
  await listMentorApplications({ user: { id: 2, role: 'mentor' } }, mentorList)
  assert.equal(mentorList.payload.length, 1)
})
