import { Navigate } from 'react-router-dom'
import { isAuthenticated, isAdmin } from '../api/auth'

function ProtectedRoute({ children, adminOnly = false }) {
    if (!isAuthenticated()) return <Navigate to="/error/401" replace />
    if (adminOnly && !isAdmin()) return <Navigate to="/error/403" replace />
    return children
}

export default ProtectedRoute
