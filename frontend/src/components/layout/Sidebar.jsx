import { NavLink, useNavigate } from 'react-router-dom'
import { clearSession, getStoredSession } from '../../services/auth'

const studentLinks = [
  ['/student', 'Dashboard'],
  ['/student/applications', 'Pendaftaran Magang'],
  ['/student/profile', 'Data Diri'],
  ['/student/documents', 'Dokumen'],
  ['/student/logbooks', 'Logbook Harian'],
  ['/student/schedule', 'Jadwal / Kegiatan'],
  ['/student/mentor', 'Mentor'],
  ['/student/assessments', 'Penilaian'],
  ['/student/final-report', 'Laporan Akhir'],
  ['/student/notifications', 'Notifikasi'],
]

const adminLinks = [
  ['/admin', 'Dashboard Admin'],
  ['/admin/applications', 'Pendaftaran Magang'],
  ['/report', 'Laporan & Penilaian'],
]

const mentorLinks = [
  ['/mentor', 'Mahasiswa Bimbingan'],
  ['/mentor/applications', 'Pendaftaran Magang'],
]

function getLinks(role) {
  if (role === 'student') return studentLinks
  if (role === 'mentor') return mentorLinks
  return adminLinks
}

export default function Sidebar() {
  const navigate = useNavigate()
  const session = getStoredSession()
  const role = session?.role?.toLowerCase()

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden min-h-[88vh] w-72 rounded-3xl border border-red-100 bg-white p-4 shadow-sm md:block">
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 p-3">
        <img src="/images/dprd-logo.webp" alt="Logo DPRD Kab. Banyumas" className="h-12 w-auto object-contain" />
        <div>
          <h2 className="text-sm font-extrabold leading-tight text-slate-950">DPRD Kabupaten Banyumas</h2>
          <p className="text-xs leading-snug text-slate-500">Sistem Informasi Magang Berdampak</p>
        </div>
      </div>

      <nav className="space-y-2">
        {getLinks(role).map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/student' || to === '/admin' || to === '/mentor'}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-red-700 text-white shadow-sm' : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
        >
          Logout
        </button>
      </nav>
    </aside>
  )
}
