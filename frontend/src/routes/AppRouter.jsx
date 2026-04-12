import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import Dashboard from '../pages/Dashboard'
import ProfilePage from '../pages/ProfilePage'
import AdminUsuarios from '../pages/AdminUsuarios'
import AdminBitacora from '../pages/AdminBitacora'
import ProtectedRoute from '../components/ProtectedRoute'

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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    )
}

export default AppRouter