
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiUserPlus, FiCheck, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import api from '../api/axios'
import { encryptPayload } from '../api/encryption'
import { validatePassword, getPasswordStrength } from '../utils/passwordValidator'
import ApiSpinner from '../components/ApiSpinner'

function RegisterPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', nombre_completo: '', password: '', telefono: '' })
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === 'telefono') {
            const cleaned = value.replace(/\D/g, '').slice(0, 10)
            setForm({ ...form, telefono: cleaned })
        } else {
            setForm({ ...form, [name]: value })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (form.telefono && form.telefono.length < 10) {
            Swal.fire({ icon: 'warning', title: 'Teléfono inválido', text: 'El número debe tener 10 dígitos.', confirmButtonColor: '#2C89F5' })
            return
        }

        const passwordValidation = validatePassword(form.password)
        if (!passwordValidation.isValid) {
            const missing = []
            if (!passwordValidation.requirements.minLength) missing.push('12 caracteres mínimo')
            if (!passwordValidation.requirements.hasUppercase) missing.push('una mayúscula')
            if (!passwordValidation.requirements.hasLowercase) missing.push('una minúscula')
            if (!passwordValidation.requirements.hasNumber) missing.push('un número')
            if (!passwordValidation.requirements.hasSpecialChar) missing.push('un carácter especial')
            
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña no cumple requisitos',
                html: `<div style="text-align: left;">La contraseña debe tener:<br/><br/>${missing.map(m => `• ${m}`).join('<br/>')}`,
                confirmButtonColor: '#2C89F5'
            })
            return
        }

        setLoading(true)

        try {
            const encryptedPayload = await encryptPayload({
                email: form.email,
                nombre_completo: form.nombre_completo,
                password: form.password,
                telefono: form.telefono || undefined,
            })
            await api.post('/registro/', encryptedPayload)
            Swal.fire({ icon: 'success', title: '¡Cuenta creada!', text: 'Ya puedes iniciar sesión.', confirmButtonColor: '#2C89F5' })
            navigate('/login')
        } catch (err) {
            const data = err.response?.data
            let msg = 'No se pudo crear la cuenta.'
            if (data?.details) {
                msg = Object.values(data.details).flat().join(' ')
            } else if (data?.message) {
                msg = data.message
            }
            Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#2C89F5' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="d-flex align-items-center justify-content-center px-3" style={{ minHeight: '90vh' }}>
            <div className="card fade-in-up" style={{ width: '100%', maxWidth: '460px', padding: '40px 36px' }}>

                <div className="text-center mb-4">
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #2C89F5, #1a6dd4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <FiUserPlus size={24} color="white" />
                    </div>
                    <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem' }}>Crear cuenta</h1>
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>Regístrate para comenzar</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-medium" style={{ fontSize: 14 }}>Nombre completo</label>
                        <div style={{ position: 'relative' }}>
                            <FiUser size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input type="text" name="nombre_completo" className="form-control"
                                placeholder="Tu nombre completo" value={form.nombre_completo}
                                onChange={handleChange} required style={{ height: 48, paddingLeft: 42 }} />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-medium" style={{ fontSize: 14 }}>Correo electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input type="email" name="email" className="form-control"
                                placeholder="tu@correo.com" value={form.email}
                                onChange={handleChange} required style={{ height: 48, paddingLeft: 42 }} />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-medium" style={{ fontSize: 14 }}>Teléfono</label>
                        <div style={{ position: 'relative' }}>
                            <FiPhone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input type="tel" name="telefono" className="form-control"
                                placeholder="10 dígitos" value={form.telefono}
                                onChange={handleChange} maxLength={10} inputMode="numeric"
                                style={{ height: 48, paddingLeft: 42 }} />
                        </div>
                        {form.telefono && form.telefono.length < 10 && (
                            <small className="text-muted" style={{ fontSize: 12 }}>{form.telefono.length}/10 dígitos</small>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium" style={{ fontSize: 14 }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input type={showPass ? 'text' : 'password'} name="password" className="form-control"
                                placeholder="Min. 12 caracteres, mayús, minús, número, símbolo" value={form.password}
                                onChange={handleChange} required minLength={12}
                                style={{ height: 48, paddingLeft: 42, paddingRight: 45 }} />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', color: '#999' }}>
                                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                        
                        {form.password && (
                            <div style={{ marginTop: 12, padding: 12, background: '#f8f9fa', borderRadius: 8, fontSize: 13 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span>Fortaleza:</span>
                                    <div style={{ width: 120, height: 6, background: '#e9ecef', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${(Object.values(validatePassword(form.password).requirements).filter(Boolean).length / 5) * 100}%`,
                                            height: '100%',
                                            background: getPasswordStrength(form.password).color,
                                            transition: 'all 0.3s ease'
                                        }} />
                                    </div>
                                    <span style={{ color: getPasswordStrength(form.password).color, fontWeight: 600 }}>
                                        {getPasswordStrength(form.password).text}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'grid', gap: 6 }}>
                                    {[
                                        { req: 'minLength', text: '12 caracteres mínimo' },
                                        { req: 'hasUppercase', text: 'Una mayúscula (A-Z)' },
                                        { req: 'hasLowercase', text: 'Una minúscula (a-z)' },
                                        { req: 'hasNumber', text: 'Un número (0-9)' },
                                        { req: 'hasSpecialChar', text: 'Carácter especial (!@#$...)' },
                                    ].map((item) => {
                                        const met = validatePassword(form.password).requirements[item.req]
                                        return (
                                            <div key={item.req} style={{ display: 'flex', alignItems: 'center', gap: 8, color: met ? '#198754' : '#adb5bd' }}>
                                                {met ? (
                                                    <FiCheck size={16} style={{ color: '#198754', flexShrink: 0 }} />
                                                ) : (
                                                    <FiX size={16} style={{ color: '#adb5bd', flexShrink: 0 }} />
                                                )}
                                                <span>{item.text}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary-custom w-100" disabled={loading}
                        style={{ height: 48, fontSize: '0.95rem' }}>
                        {loading ? <ApiSpinner mode="inline" title="Creando..." /> : 'Registrarse'}
                    </button>
                </form>

                <p className="text-center mt-4 mb-0" style={{ fontSize: 14, color: '#888' }}>
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" style={{ color: '#2C89F5', fontWeight: '600' }}>Inicia sesión</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage