import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { applicationStatusLabels, getCurrentStudentApplication } from '../services/applications'
import { getStoredSession } from '../services/auth'

const timeline = [
  ['Registrasi Akun', true],
  ['Lengkapi Data', false],
  ['Upload Dokumen', false],
  ['Ajukan Pendaftaran', false],
  ['Verifikasi Admin', false],
  ['Diterima / Ditolak', false],
]

function getCta(application) {
  if (!application) return 'Daftar Magang'
  if (application.status === 'draft') return 'Lanjutkan Pendaftaran'
  if (application.status === 'needs_revision') return 'Perbaiki Pendaftaran'
  if (application.status === 'accepted') return 'Lihat Detail Magang'
  return 'Lihat Status'
}

function isStepDone(application, index) {
  if (index === 0) return true
  if (!application) return false
  if (index === 1) return Boolean(application.namaLengkap && application.nim && application.kampus)
  if (index === 2) return application.documentSummary?.complete
  if (index === 3) return ['submitted', 'verified', 'accepted', 'rejected'].includes(application.status)
  if (index === 4) return ['verified', 'accepted', 'rejected'].includes(application.status)
  if (index === 5) return ['accepted', 'rejected'].includes(application.status)
  return false
}

export default function StudentDashboard() {
  return <DashboardLayout><div className="grid md:grid-cols-3 gap-4"><div className="glass rounded-2xl p-4"><h3 className="font-semibold">Attendance</h3><p className="text-accent">Present (QR/GPS placeholder)</p></div><div className="glass rounded-2xl p-4"><h3 className="font-semibold">Logbook Progress</h3><p>18 / 22 entries completed</p></div><div className="glass rounded-2xl p-4"><h3 className="font-semibold">Productivity Score</h3><p>89 / 100</p></div></div><div className="glass rounded-2xl p-4"><h3 className="font-semibold">AI Weekly Summary</h3><p className="text-sm">Consistent attendance, improved report writing, suggestion: increase stakeholder meeting notes detail.</p></div></DashboardLayout>
}
