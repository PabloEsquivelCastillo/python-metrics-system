import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi'
import Swal from 'sweetalert2'
import api from '../api/axios'
import { saveTokens, getUser } from '../api/auth'
import ApiSpinner from '../components/ApiSpinner'

function LoginPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await api.post('/login/', {
                email: form.email,
                password: form.password,
            })
            saveTokens(res.data.access, res.data.refresh)

            const user = getUser()
            if (user?.role === 'admin') {
                navigate('/admin/usuarios')
            } else {
                navigate('/dashboard')
            }
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.message || 'Correo o contraseña incorrectos.'
            Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#2C89F5' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="d-flex align-items-center justify-content-center px-3" style={{ minHeight: '90vh' }}>
            <div className="card fade-in-up" style={{ width: '100%', maxWidth: '460px', padding: '40px 36px' }}>
                <div className="text-center mb-4">
                    <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem' }}>Bienvenido</h1>
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>Inicia sesión para continuar</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-medium" style={{ fontSize: 14 }}>Correo electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input
                                type="email" name="email" className="form-control"
                                placeholder="tu@correo.com"
                                value={form.email} onChange={handleChange} required
                                style={{ height: 48, paddingLeft: 42 }}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-medium" style={{ fontSize: 14 }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input
                                type={showPass ? 'text' : 'password'} name="password" className="form-control"
                                placeholder="Ingresa tu contraseña"
                                value={form.password} onChange={handleChange} required
                                style={{ height: 48, paddingLeft: 42, paddingRight: 45 }}
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', color: '#999' }}>
                                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary-custom w-100" disabled={loading}
                        style={{ height: 48, fontSize: '0.95rem' }}>
                        {loading ? <ApiSpinner mode="inline" title="Iniciando..." /> : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="text-center mt-4 mb-0" style={{ fontSize: 14, color: '#888' }}>
                    ¿Aún no tienes cuenta?{' '}
                    <Link to="/register" style={{ color: '#2C89F5', fontWeight: '600' }}>Regístrate</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage