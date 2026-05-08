import {
  assessments,
  documents,
  internshipApplications,
  internshipFields,
  logbooks,
  mentorAssignments,
  notifications,
  requiredDocumentTypes,
  studentProfiles,
  users,
} from '../data/dummyData.js'

function normalizeRole(role = '') {
  return role.toLowerCase()
}

function isAssignedMentor(mentorUserId, studentUserId) {
  return mentorAssignments.some(
    (assignment) => assignment.mentorUserId === mentorUserId && assignment.studentUserId === studentUserId,
  )
}

function resolveStudentUserId(req) {
  const role = normalizeRole(req.user.role)
  const requestedStudentId = Number(req.query.studentId || req.params.studentId || req.user.id)

  if (role === 'student') return req.user.id
  if (role === 'admin') return requestedStudentId
  if (role === 'mentor' && isAssignedMentor(req.user.id, requestedStudentId)) return requestedStudentId

  return null
}

function forbidden(res) {
  return res.status(403).json({ message: 'Akses data mahasiswa tidak sesuai dengan peran pengguna.' })
}

function nextId(items) {
  return Math.max(...items.map((item) => item.id), 0) + 1
}

function getProfile(userId) {
  const user = users.find((item) => item.id === userId)
  const profile = studentProfiles.find((item) => item.userId === userId)

  return {
    userId,
    name: profile?.fullName || user?.name || '',
    email: user?.email || '',
    university: profile?.university || '',
    studyProgram: profile?.studyProgram || '',
    studentNumber: profile?.studentNumber || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    accountStatus: profile?.accountStatus || 'Aktif',
    profileStatus: profile?.profileStatus || 'Belum Lengkap',
  }
}

function getApplication(userId) {
  return internshipApplications.find((item) => item.userId === userId) || null
}

function buildStudentDocumentData(userId) {
  const ownedDocuments = documents.filter((item) => item.userId === userId)
  const uploadedTypes = new Set(ownedDocuments.map((item) => item.type))
  const missing = requiredDocumentTypes.filter((type) => !uploadedTypes.has(type))
  const verifiedCount = ownedDocuments.filter((item) => item.status === 'Terverifikasi').length

  return {
    required: requiredDocumentTypes,
    uploaded: ownedDocuments,
    missing,
    summary: {
      uploadedCount: ownedDocuments.length,
      requiredCount: requiredDocumentTypes.length,
      verifiedCount,
      status: missing.length === 0 ? 'Lengkap' : 'Belum Lengkap',
    },
  }
}

function getLogbookSummary(userId) {
  const entries = logbooks.filter((item) => item.userId === userId)
  const approvedCount = entries.filter((item) => item.status === 'Disetujui Mentor').length
  const targetCount = 30

  return {
    entries,
    summary: {
      submittedCount: entries.length,
      approvedCount,
      targetCount,
      percentage: Math.min(Math.round((entries.length / targetCount) * 100), 100),
      status: entries.length > 0 ? 'Berjalan' : 'Belum Ada Logbook',
    },
  }
}

function getMentor(userId) {
  const assignment = mentorAssignments.find((item) => item.studentUserId === userId)
  if (!assignment) return null

  const mentor = users.find((item) => item.id === assignment.mentorUserId)
  return {
    ...assignment,
    mentorName: mentor?.name || 'Mentor belum ditentukan',
    mentorEmail: mentor?.email || '',
  }
}

function buildDashboard(userId) {
  const application = getApplication(userId)
  const documentData = buildStudentDocumentData(userId)
  const logbookData = getLogbookSummary(userId)
  const studentAssessments = assessments.filter((item) => item.userId === userId)

  return {
    profile: getProfile(userId),
    application: application || {
      status: 'Belum Mengajukan',
      field: null,
      documentVerificationStatus: documentData.summary.status,
      selectionStatus: 'Belum Seleksi',
      internshipStatus: 'Belum Mulai',
      notes: 'Anda belum mengajukan pendaftaran magang.',
    },
    internshipFields,
    documents: documentData,
    logbooks: logbookData,
    mentor: getMentor(userId),
    assessments: studentAssessments,
    notifications: notifications.filter((item) => item.userId === userId),
    aiAssistant: {
      available: logbookData.summary.approvedCount >= 5,
      message: 'Ringkasan AI akan tersedia setelah logbook mencukupi.',
    },
  }
}

export const getStudentDashboard = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  return res.json(buildDashboard(studentUserId))
}

export const getStudentProfile = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  return res.json(getProfile(studentUserId))
}

export const updateStudentProfile = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  const existingProfile = studentProfiles.find((item) => item.userId === studentUserId)
  const payload = {
    fullName: req.body.fullName?.trim() || req.body.name?.trim() || existingProfile?.fullName || '',
    university: req.body.university?.trim() || '',
    studyProgram: req.body.studyProgram?.trim() || '',
    studentNumber: req.body.studentNumber?.trim() || '',
    phone: req.body.phone?.trim() || '',
    address: req.body.address?.trim() || '',
  }
  const profileStatus = Object.values(payload).every(Boolean) ? 'Lengkap' : 'Belum Lengkap'

  if (existingProfile) {
    Object.assign(existingProfile, payload, { profileStatus })
  } else {
    studentProfiles.push({
      id: nextId(studentProfiles),
      userId: studentUserId,
      ...payload,
      accountStatus: 'Aktif',
      profileStatus,
    })
  }

  return res.json(getProfile(studentUserId))
}

export const getStudentApplications = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  return res.json(internshipApplications.filter((item) => item.userId === studentUserId))
}

export const createStudentApplication = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  const field = req.body.field?.trim()
  const period = req.body.period?.trim()

  if (!field || !internshipFields.includes(field)) {
    return res.status(400).json({ message: 'Bidang magang tidak valid.' })
  }

  if (!period) {
    return res.status(400).json({ message: 'Periode magang wajib diisi.' })
  }

  const application = {
    id: nextId(internshipApplications),
    userId: studentUserId,
    field,
    period,
    status: 'Menunggu Verifikasi',
    documentVerificationStatus: buildStudentDocumentData(studentUserId).summary.status,
    selectionStatus: 'Belum Seleksi',
    internshipStatus: 'Belum Mulai',
    submittedAt: new Date().toISOString().slice(0, 10),
    notes: 'Pendaftaran diterima sistem dan menunggu verifikasi admin.',
  }

  internshipApplications.push(application)
  return res.status(201).json(application)
}

export const getStudentDocuments = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  return res.json(buildStudentDocumentData(studentUserId))
}

export const createStudentDocument = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  const type = req.body.type?.trim()
  const fileName = req.body.fileName?.trim()

  if (!type || !requiredDocumentTypes.includes(type)) {
    return res.status(400).json({ message: 'Jenis dokumen tidak valid.' })
  }

  if (!fileName) {
    return res.status(400).json({ message: 'Nama file dokumen wajib diisi.' })
  }

  const document = {
    id: nextId(documents),
    userId: studentUserId,
    type,
    fileName,
    status: 'Menunggu Verifikasi',
    uploadedAt: new Date().toISOString().slice(0, 10),
  }

  documents.push(document)
  return res.status(201).json(document)
}

export const deleteStudentDocument = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  const documentIndex = documents.findIndex(
    (item) => item.id === Number(req.params.id) && item.userId === studentUserId,
  )

  if (documentIndex === -1) return res.status(404).json({ message: 'Dokumen tidak ditemukan.' })

  documents.splice(documentIndex, 1)
  return res.status(204).send()
}

export const getStudentLogbooks = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  return res.json(getLogbookSummary(studentUserId))
}

export const createStudentLogbook = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  const activity = req.body.activity?.trim()
  const output = req.body.output?.trim()
  const date = req.body.date?.trim() || new Date().toISOString().slice(0, 10)

  if (!activity || !output) {
    return res.status(400).json({ message: 'Aktivitas dan output logbook wajib diisi.' })
  }

  const logbook = {
    id: nextId(logbooks),
    userId: studentUserId,
    date,
    activity,
    output,
    status: 'Menunggu Validasi Mentor',
  }

  logbooks.push(logbook)
  return res.status(201).json(logbook)
}

export const updateStudentLogbook = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  const logbook = logbooks.find((item) => item.id === Number(req.params.id) && item.userId === studentUserId)
  if (!logbook) return res.status(404).json({ message: 'Logbook tidak ditemukan.' })
  if (logbook.status === 'Disetujui Mentor') {
    return res.status(400).json({ message: 'Logbook yang sudah disetujui mentor tidak dapat diubah.' })
  }

  logbook.activity = req.body.activity?.trim() || logbook.activity
  logbook.output = req.body.output?.trim() || logbook.output
  logbook.date = req.body.date?.trim() || logbook.date
  return res.json(logbook)
}

export const getStudentMentor = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  return res.json(getMentor(studentUserId) || { message: 'Mentor belum ditentukan.' })
}

export const getStudentAssessments = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  return res.json(assessments.filter((item) => item.userId === studentUserId))
}

export const getStudentNotifications = (req, res) => {
  const studentUserId = resolveStudentUserId(req)
  if (!studentUserId) return forbidden(res)

  return res.json(notifications.filter((item) => item.userId === studentUserId))
}

export const __testing = {
  buildDashboard,
  resolveStudentUserId,
}
