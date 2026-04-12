import { Navigate } from 'react-router-dom'
import { isAuthenticated, isAdmin } from '../api/auth'

function ProtectedRoute({ children, adminOnly = false }) {
    if (!isAuthenticated()) return <Navigate to="/login" replace />
    if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />
    return children
}

export default ProtectedRoute
