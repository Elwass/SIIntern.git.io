import { getAuthHeader } from './auth.js'

async function parseJson(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function studentRequest(path, options = {}) {
  const response = await fetch(`/api/student${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  })

  const result = await parseJson(response)

  if (!response.ok) {
    throw new Error(result?.message || 'Data mahasiswa gagal dimuat. Silakan coba lagi.')
  }

  return result
}

export function getStudentDashboard() {
  return studentRequest('/dashboard')
}

export function getStudentProfile() {
  return studentRequest('/profile')
}

export function updateStudentProfile(payload) {
  return studentRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function createStudentApplication(payload) {
  return studentRequest('/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
