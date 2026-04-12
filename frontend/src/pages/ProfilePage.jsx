import { useState, useEffect } from 'react'
import { FiUser, FiMail, FiPhone } from 'react-icons/fi'
import Swal from 'sweetalert2'
import api from '../api/axios'
import ApiSpinner from '../components/ApiSpinner'

function ProfilePage() {
    const [form, setForm] = useState({ nombre_completo: '', telefono: '', email: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/perfil/')
                setForm({ nombre_completo: data.nombre_completo, telefono: data.telefono || '', email: data.email })
            } catch { /* interceptor */ }
            setLoading(false)
        }
        fetch()
    }, [])

    const handlePhoneChange = (e) => {
        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10)
        setForm({ ...form, telefono: cleaned })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.telefono && form.telefono.length < 10) {
            Swal.fire({ icon: 'warning', title: 'Teléfono inválido', text: 'El número debe tener 10 dígitos.', confirmButtonColor: '#2C89F5' })
            return
        }
        const result = await Swal.fire({
            title: '¿Guardar cambios?',
            text: 'Se actualizará tu información.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2C89F5',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
        })
        if (!result.isConfirmed) return
        setSaving(true)
        try {
            await api.patch('/perfil/', { nombre_completo: form.nombre_completo, telefono: form.telefono })
            Swal.fire({ icon: 'success', title: '¡Perfil actualizado!', text: 'Tus datos fueron guardados.', timer: 1800, showConfirmButton: false })
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el perfil.', confirmButtonColor: '#2C89F5' })
        }
        setSaving(false)
    }

    if (loading) return (
        <div className="container-fluid px-4 py-4 fade-in-up d-flex justify-content-center">
            <ApiSpinner
                mode="panel"
                title="Cargando perfil"
                subtitle="Estamos recuperando tu información personal."
            />
        </div>
    )

    return (
        <div className="container-fluid px-4 py-4 fade-in-up d-flex flex-column align-items-center">
            <div className="mb-4 text-center">
                <h2 className="fw-bold text-white mb-0">Mi perfil</h2>
                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Edita tu información personal</p>
            </div>

            <div className="card" style={{ maxWidth: 500, width: '100%', padding: '36px', position: 'relative' }}>
                {saving && (
                    <ApiSpinner
                        mode="overlay"
                        title="Guardando cambios"
                        subtitle="Actualizando tu perfil en la base de datos."
                        compact
                    />
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-medium" style={{ fontSize: 14 }}>Correo electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                            <input type="email" className="form-control" value={form.email} disabled
                                style={{ height: 48, paddingLeft: 42, background: '#f9f9f9', color: '#999' }} />
                        </div>
                        <small className="text-muted" style={{ fontSize: 12 }}>El correo no se puede modificar.</small>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-medium" style={{ fontSize: 14 }}>Nombre completo</label>
                        <div style={{ position: 'relative' }}>
                            <FiUser size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input type="text" className="form-control" value={form.nombre_completo}
                                onChange={e => setForm({ ...form, nombre_completo: e.target.value })}
                                required style={{ height: 48, paddingLeft: 42 }} />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-medium" style={{ fontSize: 14 }}>Teléfono</label>
                        <div style={{ position: 'relative' }}>
                            <FiPhone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                            <input type="tel" className="form-control" value={form.telefono}
                                onChange={handlePhoneChange} maxLength={10} inputMode="numeric"
                                placeholder="10 dígitos" style={{ height: 48, paddingLeft: 42 }} />
                        </div>
                        {form.telefono && form.telefono.length < 10 && (
                            <small className="text-muted" style={{ fontSize: 12 }}>{form.telefono.length}/10 dígitos</small>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary-custom" disabled={saving}
                        style={{ height: 48, paddingInline: 30, fontSize: '0.95rem' }}>
                        {saving ? <ApiSpinner mode="inline" title="Guardando..." /> : 'Guardar cambios'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProfilePage
