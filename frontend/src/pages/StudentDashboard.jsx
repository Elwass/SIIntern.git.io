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
  const [current, setCurrent] = useState({ application: null, profile: null, documents: [], documentSummary: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const session = getStoredSession()

  useEffect(() => {
    getCurrentStudentApplication()
      .then(setCurrent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout><div className="rounded-3xl bg-white p-6 shadow-sm">Memuat dashboard...</div></DashboardLayout>
  if (error) return <DashboardLayout><div role="alert" className="rounded-3xl bg-red-50 p-6 text-sm text-red-700">{error}</div></DashboardLayout>

  const summary = current.application?.documentSummary || current.documentSummary
  const application = current.application ? { ...current.application, documentSummary: summary } : null
  const profile = current.profile
  const name = profile?.namaLengkap || session?.user?.name || 'Mahasiswa'
  const documentText = application ? `${summary?.uploadedCount || 0}/${summary?.requiredCount || 5} dokumen` : '0/5 dokumen'

  return (
    <DashboardLayout>
      <section className="rounded-3xl bg-gradient-to-r from-red-800 to-slate-950 p-6 text-white shadow-sm md:p-8">
        <h1 className="text-3xl font-bold">Halo, {name}</h1>
        <p className="mt-2 text-sm text-red-50">Pantau status pendaftaran dan kelengkapan magang Anda.</p>
        <Link to="/student/applications" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-red-800 hover:bg-red-50">
          {getCta(application)}
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Status Pendaftaran</p><p className="mt-2 text-xl font-bold text-slate-950">{applicationStatusLabels[application?.status] || 'Belum Daftar'}</p>{application?.catatanAdmin && <p className="mt-2 text-sm text-amber-700">{application.catatanAdmin}</p>}</div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Kelengkapan Dokumen</p><p className="mt-2 text-xl font-bold text-slate-950">{documentText}</p>{summary?.missing?.length > 0 && <p className="mt-2 text-sm text-amber-700">Kurang: {summary.missing.join(', ')}</p>}</div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Bidang Magang</p><p className="mt-2 text-xl font-bold text-slate-950">{application?.bidangMagang || 'Belum dipilih'}</p></div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Periode Magang</p><p className="mt-2 text-xl font-bold text-slate-950">{application ? `${application.periodeMulai} s.d. ${application.periodeSelesai}` : 'Belum ditentukan'}</p></div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Timeline Pendaftaran</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-6">
          {timeline.map(([label], index) => (
            <div key={label} className={`rounded-2xl border p-4 text-sm ${isStepDone(application, index) ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>
              <p className="font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  )
}
