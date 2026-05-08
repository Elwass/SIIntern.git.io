import { Navigate, Outlet } from 'react-router-dom'
import { getDashboardPath, getStoredSession } from '../../services/auth'

export default function PublicOnlyRoute() {
  const session = getStoredSession()

  if (session) {
    return <Navigate to={getDashboardPath(session.role)} replace />
  }

  return <Outlet />
}
