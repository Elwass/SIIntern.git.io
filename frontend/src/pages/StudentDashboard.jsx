import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { getStudentDashboard } from '../services/student'

const statusTone = {
  Aktif: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Lengkap: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Terverifikasi: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Diterima: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'Menunggu Verifikasi': 'bg-amber-50 text-amber-700 ring-amber-100',
  'Perlu Perbaikan': 'bg-amber-50 text-amber-700 ring-amber-100',
  'Belum Mengajukan': 'bg-slate-100 text-slate-700 ring-slate-200',
  'Belum Lengkap': 'bg-red-50 text-red-700 ring-red-100',
  Ditolak: 'bg-red-50 text-red-700 ring-red-100',
}

function StatusBadge({ children }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone[children] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {children}
    </span>
  )
}

function InfoCard({ title, value, description, action }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <div className="mt-3 text-xl font-bold text-slate-950">{value}</div>
      {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function EmptyState({ title, description, to, label }) {
  return (
    <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/60 p-5">
      <h3 className="font-semibold text-red-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-800">{description}</p>
      {to && (
        <Link to={to} className="mt-4 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
          {label}
        </Link>
      )}
    </div>
  )
}

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getStudentDashboard()
      .then((data) => {
        if (active) setDashboard(data)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Dashboard mahasiswa gagal dimuat.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl bg-white p-8 text-sm text-slate-600 shadow-sm">Memuat dashboard mahasiswa...</div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div role="alert" className="rounded-3xl border border-red-100 bg-red-50 p-8 text-sm text-red-700">
          {error}
        </div>
      </DashboardLayout>
    )
  }

  const { profile, application, documents, logbooks, mentor, assessments, notifications, aiAssistant } = dashboard
  const hasApplication = application.status !== 'Belum Mengajukan'
  const hasLogbook = logbooks.summary.submittedCount > 0
  const hasAssessment = assessments.length > 0

  return (
    <DashboardLayout>
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-800 via-red-700 to-slate-950 p-6 text-white shadow-lg md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-100">Dashboard Mahasiswa Magang</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Selamat datang, {profile.name || 'Mahasiswa'}.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-red-50">
              Pantau status pendaftaran, kelengkapan berkas, logbook harian, mentor, dan penilaian program magang DPRD Kabupaten Banyumas.
            </p>
          </div>
          {!hasApplication && (
            <Link to="/student/applications" className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-red-800 hover:bg-red-50">
              Daftar Magang
            </Link>
          )}
        </div>
      </section>

      {profile.profileStatus !== 'Lengkap' && (
        <EmptyState
          title="Data diri belum lengkap"
          description="Lengkapi data kampus, program studi, nomor mahasiswa, kontak, dan alamat sebelum mengajukan pendaftaran magang."
          to="/student/profile"
          label="Lengkapi Data Diri"
        />
      )}

      {!hasApplication && (
        <EmptyState
          title="Anda belum mengajukan pendaftaran magang"
          description="Pilih bidang magang dan periode pelaksanaan agar admin dapat memverifikasi pengajuan Anda."
          to="/student/applications"
          label="Daftar Magang"
        />
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Status Akun Mahasiswa" value={<StatusBadge>{profile.accountStatus}</StatusBadge>} description={profile.profileStatus} />
        <InfoCard title="Status Pendaftaran" value={<StatusBadge>{application.status}</StatusBadge>} description={application.notes} />
        <InfoCard title="Bidang Magang" value={application.field || 'Belum memilih bidang'} description={application.period || 'Periode belum diajukan'} />
        <InfoCard title="Verifikasi Berkas" value={<StatusBadge>{application.documentVerificationStatus}</StatusBadge>} description={`${documents.summary.uploadedCount}/${documents.summary.requiredCount} dokumen terunggah`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Alur Pendaftaran & Pelaksanaan</h2>
              <p className="text-sm text-slate-500">Status terbaru berdasarkan data backend mahasiswa.</p>
            </div>
            <Link to="/student/applications" className="text-sm font-semibold text-red-700 hover:text-red-800">
              Kelola Pendaftaran
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoCard title="Seleksi" value={<StatusBadge>{application.selectionStatus}</StatusBadge>} />
            <InfoCard title="Pelaksanaan Magang" value={<StatusBadge>{application.internshipStatus}</StatusBadge>} />
            <InfoCard title="Logbook" value={`${logbooks.summary.submittedCount}/${logbooks.summary.targetCount}`} description={`${logbooks.summary.percentage}% target logbook`} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Mentor Pembimbing</h2>
          {mentor ? (
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">{mentor.mentorName}</p>
              <p>{mentor.division}</p>
              <p>{mentor.mentorEmail}</p>
            </div>
          ) : (
            <EmptyState title="Mentor belum ditentukan" description="Mentor akan muncul setelah pendaftaran diverifikasi dan penempatan ditetapkan." />
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Dokumen Wajib</h2>
            <Link to="/student/documents" className="text-sm font-semibold text-red-700 hover:text-red-800">Kelola Dokumen</Link>
          </div>
          {documents.missing.length > 0 && (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              Dokumen belum lengkap: {documents.missing.join(', ')}.
            </div>
          )}
          <div className="mt-4 space-y-3">
            {documents.uploaded.map((document) => (
              <div key={document.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{document.type}</p>
                  <p className="text-slate-500">{document.fileName}</p>
                </div>
                <StatusBadge>{document.status}</StatusBadge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Logbook Harian</h2>
            <Link to="/student/logbooks" className="text-sm font-semibold text-red-700 hover:text-red-800">Isi Logbook</Link>
          </div>
          {!hasLogbook ? (
            <div className="mt-4">
              <EmptyState title="Belum ada logbook" description="Logbook dapat diisi setelah pelaksanaan magang dimulai dan mentor ditetapkan." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {logbooks.entries.slice(0, 3).map((logbook) => (
                <div key={logbook.id} className="rounded-2xl border border-slate-100 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{logbook.date}</p>
                    <StatusBadge>{logbook.status}</StatusBadge>
                  </div>
                  <p className="mt-2 text-slate-600">{logbook.activity}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Penilaian Mentor</h2>
          {!hasAssessment ? (
            <p className="mt-3 text-sm text-slate-600">Belum ada penilaian. Penilaian akan muncul setelah mentor melakukan evaluasi.</p>
          ) : (
            assessments.map((assessment) => <p key={assessment.id}>{assessment.score}</p>)
          )}
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">AI Assistant</h2>
          <p className="mt-3 text-sm text-slate-600">{aiAssistant.message}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Notifikasi</h2>
          {notifications.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Belum ada notifikasi.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-slate-600">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  )
}
