import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { isAuthenticated, isAdmin } from '../api/auth'

function ProtectedRoute({ children, adminOnly = false }) {
    if (!isAuthenticated()) return <Navigate to="/error/401" replace />
    if (adminOnly && !isAdmin()) return <Navigate to="/error/403" replace />
    return children
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    adminOnly: PropTypes.bool,
}

export default ProtectedRoute
