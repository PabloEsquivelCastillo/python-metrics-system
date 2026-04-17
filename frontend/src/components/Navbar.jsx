
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { isAuthenticated, isAdmin, getUser, clearTokens } from '../api/auth'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const auth = isAuthenticated()
    const admin = isAdmin()
    const user = getUser()
    const [menuOpen, setMenuOpen] = useState(false)
    const homePath = !auth ? '/login' : (admin ? '/admin/usuarios' : '/dashboard')
    const showDesktopLeftBorder = globalThis.innerWidth >= 768

    const logout = async () => {
        const result = await Swal.fire({
            title: '¿Cerrar sesión?',
            text: 'Se cerrará tu sesión actual.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2C89F5',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
        })
        if (!result.isConfirmed) return
        clearTokens()
        navigate('/login')
    }

    const isActive = (path) => location.pathname.startsWith(path)
    const linkClass = (path) =>
        `nav-link-custom ${isActive(path) ? 'active' : ''}`

    return (
        <nav className="navbar bg-white" style={{
            height: 'auto', minHeight: 60, boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            position: 'sticky', top: 0, zIndex: 1000
        }}>
            <div className="container-fluid px-4 d-flex align-items-center justify-content-between flex-wrap">
                <div className="d-flex align-items-center justify-content-between w-100 d-md-none">
                    <Link to={homePath}
                        className="navbar-brand mb-0 fw-bold" style={{ color: '#2C89F5', fontSize: 20, textDecoration: 'none' }}>
                        Python Analyzer
                    </Link>
                    {auth && (
                        <button onClick={() => setMenuOpen(!menuOpen)}
                            style={{ background: 'none', border: 'none', padding: 4 }}>
                            {menuOpen ? <FiX size={24} color="#333" /> : <FiMenu size={24} color="#333" />}
                        </button>
                    )}
                </div>

                <Link to={homePath}
                    className="navbar-brand mb-0 fw-bold d-none d-md-block" style={{ color: '#2C89F5', fontSize: 22, textDecoration: 'none' }}>
                    Python Analyzer
                </Link>

                {auth && (
                    <div className={`d-md-flex align-items-center gap-4 ${menuOpen ? 'd-flex flex-column align-items-start w-100 py-2 gap-2' : 'd-none'}`}>
                        {admin ? (
                            <>
                                <Link to="/admin/usuarios" className={linkClass('/admin/usuarios')} onClick={() => setMenuOpen(false)}>Usuarios</Link>
                                <Link to="/admin/bitacora" className={linkClass('/admin/bitacora')} onClick={() => setMenuOpen(false)}>Bitácora</Link>
                            </>
                        ) : (
                            <Link to="/dashboard" className={linkClass('/dashboard')} onClick={() => setMenuOpen(false)}>Archivos</Link>
                        )}
                        <Link to="/perfil" className={linkClass('/perfil')} onClick={() => setMenuOpen(false)}>
                            <FiUser size={15} className="me-1" />Perfil
                        </Link>

                        <div className="d-flex align-items-center gap-2 ms-md-2 ps-md-3" style={{ borderLeft: showDesktopLeftBorder ? '1px solid #eee' : 'none' }}>
                            <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{user?.nombre_completo || user?.email}</span>
                            <button className="btn btn-sm d-flex align-items-center gap-1" onClick={logout}
                                style={{ background: '#f5f5f5', color: '#666', borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
                                <FiLogOut size={14} /> Salir
                            </button>
                        </div>
                    </div>
                )}

                {!auth && (
                    <div className="d-flex gap-3">
                        <Link to="/login" className={linkClass('/login')}>Iniciar sesión</Link>
                        <Link to="/register" className={linkClass('/register')}>Crear cuenta</Link>
                    </div>
                )}
            </div>

            <style>{`
                .nav-link-custom {
                    color: #666;
                    font-weight: 500;
                    font-size: 14px;
                    text-decoration: none;
                    padding: 6px 12px;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }
                .nav-link-custom:hover {
                    color: #2C89F5;
                    background: rgba(44, 137, 245, 0.06);
                }
                .nav-link-custom.active {
                    color: #2C89F5;
                    font-weight: 600;
                    background: rgba(44, 137, 245, 0.1);
                }
            `}</style>
        </nav>
    )
}

export default Navbar