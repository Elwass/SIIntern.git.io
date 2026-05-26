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
export function assignApplicationMentor(id, mentorId) { return apiRequest(`/api/admin/applications/${id}/assign-mentor`, { method: 'PATCH', body: JSON.stringify({ mentorId }) }) }
export function listMentorApplications() { return apiRequest('/api/mentor/applications') }
export function getMentorApplication(id) { return apiRequest(`/api/mentor/applications/${id}`) }
