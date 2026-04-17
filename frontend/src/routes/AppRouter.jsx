import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import Dashboard from '../pages/Dashboard'
import ProfilePage from '../pages/ProfilePage'
import AdminUsuarios from '../pages/AdminUsuarios'
import AdminBitacora from '../pages/AdminBitacora'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import ForbiddenPage from '../pages/ForbiddenPage'
import NotFoundPage from '../pages/NotFoundPage'
import ServerErrorPage from '../pages/ServerErrorPage'
import ProtectedRoute from '../components/ProtectedRoute'
import { isAuthenticated, isAdmin } from '../api/auth'

function FallbackRedirect() {
    if (!isAuthenticated()) return <Navigate to="/login" replace />
    return <Navigate to={isAdmin() ? '/admin/usuarios' : '/dashboard'} replace />
}

function AppRouter() {
    return (
        <Routes>
            {/* Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Usuario autenticado */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Solo admin */}
            <Route path="/admin/usuarios" element={<ProtectedRoute adminOnly><AdminUsuarios /></ProtectedRoute>} />
            <Route path="/admin/bitacora" element={<ProtectedRoute adminOnly><AdminBitacora /></ProtectedRoute>} />

            {/* Errores */}
            <Route path="/error/401" element={<UnauthorizedPage />} />
            <Route path="/error/403" element={<ForbiddenPage />} />
            <Route path="/error/404" element={<NotFoundPage />} />
            <Route path="/error/500" element={<ServerErrorPage />} />

            {/* Fallback */}
            <Route path="*" element={<FallbackRedirect />} />
        </Routes>
    )
}

export default AppRouter