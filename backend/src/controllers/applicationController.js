import {
  applicationDocuments,
  applicationStatuses,
  documentStatuses,
  internshipApplications,
  internshipFields,
  requiredDocumentTypes,
  users,
} from '../data/dummyData.js'

const editableStatuses = ['draft', 'needs_revision']
const activeStatuses = ['draft', 'submitted', 'needs_revision', 'verified', 'accepted']
const allowedAdminTransitions = {
  submitted: ['needs_revision', 'verified'],
  verified: ['accepted', 'rejected'],
  needs_revision: ['submitted'],
}

const requiredApplicationFields = [
  'namaLengkap',
  'nim',
  'kampus',
  'programStudi',
  'semester',
  'email',
  'noHp',
  'alamat',
  'bidangMagang',
  'periodeMulai',
  'periodeSelesai',
  'motivasi',
]

function now() {
  return new Date().toISOString()
}

function nextId(items) {
  return Math.max(...items.map((item) => item.id), 0) + 1
}

function error(res, status, message, details) {
  return res.status(status).json({ message, ...(details ? { details } : {}) })
}

function requireRole(req, res, role) {
  if (req.user?.role !== role) {
    error(res, 403, 'Akses ditolak untuk peran pengguna ini.')
    return false
  }
  return true
}

function findApplication(id) {
  return internshipApplications.find((application) => application.id === Number(id))
}

function findApplicationForStudent(id, userId) {
  return internshipApplications.find((application) => application.id === Number(id) && application.userId === userId)
}

function getCurrentApplication(userId) {
  return internshipApplications.find((application) => application.userId === userId && activeStatuses.includes(application.status)) || null
}

function getDocuments(applicationId) {
  return applicationDocuments.filter((document) => document.applicationId === Number(applicationId))
}

function getMentor(mentorId) {
  if (!mentorId) return null
  const mentor = users.find((user) => user.id === mentorId && user.role === 'mentor')
  return mentor ? { id: mentor.id, name: mentor.name, email: mentor.email } : null
}

function serializeApplication(application, includeDocuments = true) {
  if (!application) return null
  const documents = getDocuments(application.id)
  const uploadedTypes = new Set(documents.map((document) => document.jenisDokumen))
  const missingDocuments = requiredDocumentTypes.filter((type) => !uploadedTypes.has(type))

  return {
    ...application,
    mentor: getMentor(application.mentorId),
    documents: includeDocuments ? documents : undefined,
    documentSummary: {
      required: requiredDocumentTypes,
      uploadedCount: documents.length,
      requiredCount: requiredDocumentTypes.length,
      missing: missingDocuments,
      complete: missingDocuments.length === 0,
      verifiedCount: documents.filter((document) => document.status === 'verified').length,
      needsRevisionCount: documents.filter((document) => document.status === 'needs_revision').length,
      rejectedCount: documents.filter((document) => document.status === 'rejected').length,
    },
  }
}

function sanitizePayload(body) {
  const payload = {}
  for (const field of requiredApplicationFields) {
    payload[field] = typeof body[field] === 'string' ? body[field].trim() : body[field]
  }
  payload.semester = Number(payload.semester)
  return payload
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateApplicationPayload(payload) {
  const missing = requiredApplicationFields.filter((field) => !payload[field])
  if (missing.length > 0) return `Field wajib belum diisi: ${missing.join(', ')}.`
  if (!validateEmail(payload.email)) return 'Format email tidak valid.'
  if (!Number.isInteger(payload.semester) || payload.semester < 1 || payload.semester > 14) return 'Semester harus berupa angka 1 sampai 14.'
  if (!internshipFields.includes(payload.bidangMagang)) return 'Bidang magang tidak valid.'
  if (payload.periodeSelesai < payload.periodeMulai) return 'Periode selesai tidak boleh sebelum periode mulai.'
  return ''
}

function validateRequiredDocuments(applicationId) {
  const documents = getDocuments(applicationId)
  const uploadedTypes = new Set(documents.map((document) => document.jenisDokumen))
  return requiredDocumentTypes.filter((type) => !uploadedTypes.has(type))
}

function assertStudentApplication(req, res) {
  if (!requireRole(req, res, 'student')) return null
  const application = findApplicationForStudent(req.params.id, req.user.id)
  if (!application) error(res, 404, 'Pendaftaran magang tidak ditemukan.')
  return application
}

export const getApplicationOptions = (_, res) => {
  return res.json({ internshipFields, requiredDocumentTypes, applicationStatuses, documentStatuses })
}

export const getCurrentStudentApplication = (req, res) => {
  if (!requireRole(req, res, 'student')) return null
  return res.json(serializeApplication(getCurrentApplication(req.user.id)))
}

export const createStudentApplication = (req, res) => {
  if (!requireRole(req, res, 'student')) return null
  const currentApplication = getCurrentApplication(req.user.id)
  if (currentApplication) {
    return error(res, 409, 'Anda sudah memiliki pendaftaran aktif. Selesaikan atau batalkan pendaftaran tersebut terlebih dahulu.')
  }

  const payload = sanitizePayload(req.body)
  const validationMessage = validateApplicationPayload(payload)
  if (validationMessage) return error(res, 400, validationMessage)

  const timestamp = now()
  const application = {
    id: nextId(internshipApplications),
    userId: req.user.id,
    ...payload,
    status: 'draft',
    catatanAdmin: '',
    mentorId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    submittedAt: null,
  }

  internshipApplications.push(application)
  return res.status(201).json(serializeApplication(application))
}

export const updateStudentApplication = (req, res) => {
  const application = assertStudentApplication(req, res)
  if (!application) return null
  if (!editableStatuses.includes(application.status)) {
    return error(res, 400, 'Pendaftaran hanya dapat diedit saat status Draft atau Perlu Perbaikan.')
  }

  const payload = sanitizePayload({ ...application, ...req.body })
  const validationMessage = validateApplicationPayload(payload)
  if (validationMessage) return error(res, 400, validationMessage)

  Object.assign(application, payload, { updatedAt: now() })
  return res.json(serializeApplication(application))
}

export const submitStudentApplication = (req, res) => {
  const application = assertStudentApplication(req, res)
  if (!application) return null
  if (!editableStatuses.includes(application.status)) {
    return error(res, 400, 'Pendaftaran pada status saat ini tidak dapat diajukan ulang.')
  }

  const validationMessage = validateApplicationPayload(application)
  if (validationMessage) return error(res, 400, validationMessage)

  const missingDocuments = validateRequiredDocuments(application.id)
  if (missingDocuments.length > 0) {
    return error(res, 400, `Dokumen wajib belum lengkap: ${missingDocuments.join(', ')}.`)
  }

  Object.assign(application, {
    status: 'submitted',
    updatedAt: now(),
    submittedAt: now(),
  })
  return res.json(serializeApplication(application))
}

export const createStudentApplicationDocument = (req, res) => {
  const application = assertStudentApplication(req, res)
  if (!application) return null
  if (!editableStatuses.includes(application.status)) {
    return error(res, 400, 'Dokumen hanya dapat diunggah saat status Draft atau Perlu Perbaikan.')
  }

  const jenisDokumen = req.body.jenisDokumen?.trim()
  const fileName = req.body.fileName?.trim()
  const fileSize = Number(req.body.fileSize || 0)
  const mimeType = req.body.mimeType || ''

  if (!requiredDocumentTypes.includes(jenisDokumen)) return error(res, 400, 'Jenis dokumen tidak valid.')
  if (!fileName) return error(res, 400, 'Nama file dokumen wajib diisi.')
  if (fileSize > 5 * 1024 * 1024) return error(res, 400, 'Ukuran file maksimal 5MB.')
  if (mimeType && !['application/pdf', 'image/jpeg', 'image/png'].includes(mimeType)) {
    return error(res, 400, 'Tipe file harus PDF, JPG, atau PNG.')
  }

  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
  const existingDocument = applicationDocuments.find(
    (document) => document.applicationId === application.id && document.jenisDokumen === jenisDokumen,
  )
  const documentPayload = {
    applicationId: application.id,
    studentId: req.user.id,
    jenisDokumen,
    fileName,
    filePath: `/uploads/application-${application.id}/${safeFileName}`,
    fileUrl: `/uploads/application-${application.id}/${safeFileName}`,
    status: 'uploaded',
    catatanAdmin: '',
    uploadedAt: now(),
  }

  if (existingDocument) {
    Object.assign(existingDocument, documentPayload)
    return res.json(existingDocument)
  }

  const document = { id: nextId(applicationDocuments), ...documentPayload }
  applicationDocuments.push(document)
  return res.status(201).json(document)
}

export const getStudentApplicationDocuments = (req, res) => {
  const application = assertStudentApplication(req, res)
  if (!application) return null
  return res.json(getDocuments(application.id))
}

export const deleteStudentApplicationDocument = (req, res) => {
  const application = assertStudentApplication(req, res)
  if (!application) return null
  if (!editableStatuses.includes(application.status)) {
    return error(res, 400, 'Dokumen hanya dapat dihapus saat status Draft atau Perlu Perbaikan.')
  }

  const documentIndex = applicationDocuments.findIndex(
    (document) => document.id === Number(req.params.documentId) && document.applicationId === application.id,
  )
  if (documentIndex === -1) return error(res, 404, 'Dokumen tidak ditemukan.')

  applicationDocuments.splice(documentIndex, 1)
  return res.status(204).send()
}

export const listAdminApplications = (req, res) => {
  if (!requireRole(req, res, 'admin')) return null
  const { status = '', bidang_magang: bidangMagang = '', kampus = '', search = '', page = 1, limit = 10 } = req.query
  const normalizedSearch = search.toLowerCase()
  let data = internshipApplications

  if (status) data = data.filter((application) => application.status === status)
  if (bidangMagang) data = data.filter((application) => application.bidangMagang === bidangMagang)
  if (kampus) data = data.filter((application) => application.kampus.toLowerCase().includes(kampus.toLowerCase()))
  if (normalizedSearch) {
    data = data.filter((application) =>
      [application.namaLengkap, application.nim, application.email].some((value) => value.toLowerCase().includes(normalizedSearch)),
    )
  }

  const pageNumber = Math.max(Number(page), 1)
  const limitNumber = Math.max(Number(limit), 1)
  const start = (pageNumber - 1) * limitNumber
  const paginated = data.slice(start, start + limitNumber)

  return res.json({
    data: paginated.map((application) => serializeApplication(application, false)),
    meta: { page: pageNumber, limit: limitNumber, total: data.length },
  })
}

export const getAdminApplicationDetail = (req, res) => {
  if (!requireRole(req, res, 'admin')) return null
  const application = findApplication(req.params.id)
  if (!application) return error(res, 404, 'Pendaftaran magang tidak ditemukan.')
  return res.json(serializeApplication(application))
}

export const updateAdminApplicationStatus = (req, res) => {
  if (!requireRole(req, res, 'admin')) return null
  const application = findApplication(req.params.id)
  if (!application) return error(res, 404, 'Pendaftaran magang tidak ditemukan.')

  const nextStatus = req.body.status
  if (!applicationStatuses.includes(nextStatus)) return error(res, 400, 'Status pendaftaran tidak valid.')
  const allowed = allowedAdminTransitions[application.status] || []
  if (!allowed.includes(nextStatus)) return error(res, 400, `Status ${application.status} tidak dapat diubah menjadi ${nextStatus}.`)

  Object.assign(application, {
    status: nextStatus,
    catatanAdmin: req.body.catatanAdmin?.trim() || application.catatanAdmin,
    updatedAt: now(),
  })
  return res.json(serializeApplication(application))
}

export const updateAdminDocumentStatus = (req, res) => {
  if (!requireRole(req, res, 'admin')) return null
  const application = findApplication(req.params.id)
  if (!application) return error(res, 404, 'Pendaftaran magang tidak ditemukan.')
  const document = applicationDocuments.find(
    (item) => item.id === Number(req.params.documentId) && item.applicationId === application.id,
  )
  if (!document) return error(res, 404, 'Dokumen tidak ditemukan.')

  const nextStatus = req.body.status
  if (!['verified', 'needs_revision', 'rejected'].includes(nextStatus)) return error(res, 400, 'Status dokumen tidak valid.')

  Object.assign(document, {
    status: nextStatus,
    catatanAdmin: req.body.catatanAdmin?.trim() || '',
  })
  return res.json(document)
}

export const assignApplicationMentor = (req, res) => {
  if (!requireRole(req, res, 'admin')) return null
  const application = findApplication(req.params.id)
  if (!application) return error(res, 404, 'Pendaftaran magang tidak ditemukan.')
  if (application.status !== 'accepted') return error(res, 400, 'Mentor hanya dapat ditetapkan untuk pendaftaran yang sudah diterima.')

  const mentorId = Number(req.body.mentorId)
  const mentor = users.find((user) => user.id === mentorId && user.role === 'mentor')
  if (!mentor) return error(res, 400, 'User mentor tidak valid.')

  Object.assign(application, { mentorId, updatedAt: now() })
  return res.json(serializeApplication(application))
}

export const listMentorApplications = (req, res) => {
  if (!requireRole(req, res, 'mentor')) return null
  const data = internshipApplications.filter(
    (application) => application.status === 'accepted' && application.mentorId === req.user.id,
  )
  return res.json(data.map((application) => serializeApplication(application, false)))
}

export const getMentorApplicationDetail = (req, res) => {
  if (!requireRole(req, res, 'mentor')) return null
  const application = findApplication(req.params.id)
  if (!application || application.status !== 'accepted' || application.mentorId !== req.user.id) {
    return error(res, 403, 'Mentor tidak memiliki akses ke pendaftaran ini.')
  }
  return res.json(serializeApplication(application))
}

export const __testing = {
  serializeApplication,
  validateApplicationPayload,
  validateRequiredDocuments,
}
