import { useNavigate } from 'react-router-dom'
import { clearSession, getStoredSession } from '../../services/auth'

export default function Topbar() {
  const navigate = useNavigate()
  const session = getStoredSession()
  const displayName = session?.user?.name || session?.user?.email || 'Pengguna'
  const role = session?.role || 'user'

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <header className="rounded-3xl border border-red-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">DPRD Kabupaten Banyumas</p>
          <h1 className="text-lg font-bold text-slate-950">Sistem Informasi Magang Berdampak</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{role}</span>
          <span className="text-sm font-medium text-slate-700">{displayName}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-red-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
