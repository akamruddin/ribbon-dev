import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

export default function ProtectedRoute() {
  const { user, initializing } = useAuthStore()
  const location = useLocation()

  if (initializing) return null

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
