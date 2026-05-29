import { getAuthHeader } from './auth.js'

const backendBaseUrl = ((import.meta?.env?.VITE_API_BASE_URL) || 'http://localhost:5000').replace(/\/$/, '')

export function resolveFileUrl(fileUrl = '') {
  if (!fileUrl) return ''
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl
  return `${backendBaseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
}

export const applicationStatusLabels = {
  draft: 'Belum Diajukan',
  pending: 'Diajukan',
  verified: 'Verifikasi Admin',
  accepted: 'Diterima',
  rejected: 'Ditolak',
  needs_revision: 'Perlu Revisi',
}


export const documentTypeLabels = {
  surat_pengantar_kampus: 'Surat Pengantar Kampus',
  curriculum_vitae: 'Curriculum Vitae',
  kartu_tanda_mahasiswa: 'Kartu Tanda Mahasiswa',
  pas_foto: 'Pas Foto',
  transkrip_nilai: 'Transkrip Nilai',
}

export const documentStatusLabels = {
  uploaded: 'Diunggah',
  verified: 'Terverifikasi',
  needs_revision: 'Perlu Perbaikan',
  rejected: 'Ditolak',
}

async function parseJson(response) {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return null }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  })
  const result = await parseJson(response)
  if (!response.ok) throw new Error(result?.message || 'Permintaan pendaftaran gagal diproses.')
  return result
}

export function getApplicationOptions() { return apiRequest('/api/student/applications/options') }
export function getCurrentStudentApplication() { return apiRequest('/api/student/my-application') }
export function createStudentApplication(payload) { return apiRequest('/api/student/register-internship', { method: 'POST', body: JSON.stringify(payload) }) }
export function updateStudentApplication(id, payload) { return apiRequest(`/api/student/applications/${id}`, { method: 'PUT', body: JSON.stringify(payload) }) }
export function submitStudentApplication(id) { return apiRequest(`/api/student/applications/${id}/submit`, { method: 'POST' }) }
export function uploadStudentDocument(id, payload) { return apiRequest(`/api/student/applications/${id}/documents`, { method: 'POST', body: JSON.stringify(payload) }) }
export function deleteStudentDocument(applicationId, documentId) { return apiRequest(`/api/student/applications/${applicationId}/documents/${documentId}`, { method: 'DELETE' }) }
export function listAdminApplications(params = {}) { return apiRequest(`/api/admin/applications?${new URLSearchParams(params)}`) }
export function getAdminApplication(id) { return apiRequest(`/api/admin/applications/${id}`) }
export function updateAdminApplicationStatus(id, payload) {
  const endpointByStatus = { verified: 'verify', accepted: 'approve', rejected: 'reject' }
  const endpoint = endpointByStatus[payload?.status]
  if (endpoint) return apiRequest(`/api/admin/applications/${id}/${endpoint}`, { method: 'PUT', body: JSON.stringify(payload) })
  return apiRequest(`/api/admin/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) })
}
export function updateAdminDocumentStatus(applicationId, documentId, payload) { return apiRequest(`/api/admin/applications/${applicationId}/documents/${documentId}/status`, { method: 'PATCH', body: JSON.stringify(payload) }) }
export function listMentorUsers() { return apiRequest('/api/admin/users?role=mentor') }

export function listMentors() { return apiRequest('/api/admin/mentors') }
export function createMentor(payload) { return apiRequest('/api/admin/mentors', { method: 'POST', body: JSON.stringify(payload) }) }
export function updateMentor(id, payload) { return apiRequest(`/api/admin/mentors/${id}`, { method: 'PUT', body: JSON.stringify(payload) }) }
export function deleteMentor(id) { return apiRequest(`/api/admin/mentors/${id}`, { method: 'DELETE' }) }

export function assignApplicationMentor(id, mentorId) { return apiRequest(`/api/admin/applications/${id}/assign-mentor`, { method: 'POST', body: JSON.stringify({ mentorId }) }) }
export function listMentorApplications() { return apiRequest('/api/mentor/applications') }
export function getMentorApplication(id) { return apiRequest(`/api/mentor/applications/${id}`) }

export const attendanceStatusLabels = { present: 'Hadir', late: 'Terlambat', sick: 'Sakit', permit: 'Izin', absent: 'Alpa' }
export const logbookStatusLabels = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' }

export function listStudentNotifications() { return apiRequest('/api/student/notifications') }
export function markStudentNotificationRead(id) { return apiRequest(`/api/student/notifications/${id}/read`, { method: 'PATCH' }) }
export function listStudentLogbooks(applicationId) { return apiRequest(`/api/student/applications/${applicationId}/logbooks`) }
export function createStudentLogbook(applicationId, payload) { return apiRequest(`/api/student/applications/${applicationId}/logbooks`, { method: 'POST', body: JSON.stringify(payload) }) }
export function deleteStudentLogbook(applicationId, logbookId) { return apiRequest(`/api/student/applications/${applicationId}/logbooks/${logbookId}`, { method: 'DELETE' }) }
export function listStudentAttendance(applicationId) { return apiRequest(`/api/student/applications/${applicationId}/attendance`) }
export function studentCheckIn(applicationId, payload = {}) { return apiRequest(`/api/student/applications/${applicationId}/attendance/check-in`, { method: 'POST', body: JSON.stringify(payload) }) }
export function studentCheckOut(applicationId, payload = {}) { return apiRequest(`/api/student/applications/${applicationId}/attendance/check-out`, { method: 'POST', body: JSON.stringify(payload) }) }
export function getStudentEvaluation(applicationId) { return apiRequest(`/api/student/applications/${applicationId}/evaluation`) }

export function listMentorNotifications() { return apiRequest('/api/mentor/notifications') }
export function listMentorLogbooks(params = {}) {
  if (params.applicationId) return apiRequest(`/api/mentor/applications/${params.applicationId}/logbooks?${new URLSearchParams(params)}`)
  return apiRequest(`/api/mentor/logbooks?${new URLSearchParams(params)}`)
}
export function reviewMentorLogbook(applicationId, logbookId, payload) { return apiRequest(`/api/mentor/applications/${applicationId}/logbooks/${logbookId}/review`, { method: 'PATCH', body: JSON.stringify(payload) }) }
export function listMentorAttendance(applicationId) { return apiRequest(`/api/mentor/applications/${applicationId}/attendance`) }
export function upsertMentorAttendance(applicationId, payload) { return apiRequest(`/api/mentor/applications/${applicationId}/attendance`, { method: 'POST', body: JSON.stringify(payload) }) }
export function upsertMentorEvaluation(applicationId, payload) { return apiRequest(`/api/mentor/applications/${applicationId}/evaluation`, { method: 'PUT', body: JSON.stringify(payload) }) }
export function getMentorEvaluation(applicationId) { return apiRequest(`/api/mentor/applications/${applicationId}/evaluation`) }
export function reviewMentorDocument(applicationId, documentId, payload) { return apiRequest(`/api/mentor/applications/${applicationId}/documents/${documentId}/review`, { method: 'PATCH', body: JSON.stringify(payload) }) }

export function getAdminDashboard() { return apiRequest('/api/admin/dashboard') }
export function listAdminAttendance(params = {}) { return apiRequest(`/api/admin/attendance?${new URLSearchParams(params)}`) }
export function correctAdminAttendance(applicationId, payload) { return apiRequest(`/api/admin/attendance/${applicationId}`, { method: 'PATCH', body: JSON.stringify(payload) }) }
export function sendAdminNotification(payload) { return apiRequest('/api/admin/notifications', { method: 'POST', body: JSON.stringify(payload) }) }
export function exportReportUrl(role, type, params = {}) {
  const qs = new URLSearchParams({ ...params, format: params.format || 'csv' })
  return `/api/${role}/reports/${type}?${qs}`
}
