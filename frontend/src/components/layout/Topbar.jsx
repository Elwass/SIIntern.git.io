import { useNavigate } from 'react-router-dom'
import { clearSession, getStoredSession } from '../../services/auth'

export default function Topbar() {
  const navigate = useNavigate()
  const session = getStoredSession()
  const displayName = session?.user?.name || session?.user?.email || 'User Profile'

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <header className="glass rounded-2xl px-5 py-3 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
      <p className="font-semibold">Secretariat DPRD Banyumas Internship Dashboard</p>
      <div className="flex items-center gap-3">
        <span className="text-sm">🔔</span>
        <span className="text-sm font-medium">{displayName}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
