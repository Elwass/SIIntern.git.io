import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getStoredSession, getDashboardPath } from '../../services/auth'

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation()
  const session = getStoredSession()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles.length > 0) {
    const role = String(session.role || session.user?.role || '').toLowerCase()
    const normalizedAllowedRoles = allowedRoles.map((allowedRole) => String(allowedRole).toLowerCase())

    if (!normalizedAllowedRoles.includes(role)) {
      return <Navigate to={getDashboardPath(role)} replace />
    }
  }

  return <Outlet />
}
