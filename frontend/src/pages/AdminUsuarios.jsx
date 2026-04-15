import { useState, useEffect, useCallback } from 'react'
import { FiEdit2, FiUserCheck, FiUserX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import api from '../api/axios'
import ApiSpinner from '../components/ApiSpinner'

function AdminUsuarios() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editUser, setEditUser] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [busyUserId, setBusyUserId] = useState(null)
    const [savingEdit, setSavingEdit] = useState(false)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/usuarios/')
            setUsers(data)
        } catch { /* interceptor handles */ }
        setLoading(false)
    }, [])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    const toggleActive = async (user) => {
        const action = user.is_active ? 'desactivar' : 'activar'
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se va a ${action} al usuario ${user.email}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: user.is_active ? '#ef4444' : '#22c55e',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: 'Cancelar',
        })
        if (!result.isConfirmed) return

        try {
            setBusyUserId(user.id)
            await api.patch(`/admin/usuarios/${user.id}/`, { is_active: !user.is_active })
            await fetchUsers()
            Swal.fire({ icon: 'success', title: '¡Listo!', text: `Usuario ${action === 'desactivar' ? 'desactivado' : 'activado'} correctamente.`, timer: 1800, showConfirmButton: false })
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el usuario.', confirmButtonColor: '#2C89F5' })
        } finally {
            setBusyUserId(null)
        }
    }

    const openEdit = (user) => {
        setEditUser(user)
        setEditForm({ nombre_completo: user.nombre_completo, telefono: user.telefono || '', role: user.role })
    }

    const saveEdit = async (e) => {
        e.preventDefault()
        if (editForm.telefono && editForm.telefono.length > 10) {
            Swal.fire({ icon: 'warning', title: 'Teléfono inválido', text: 'El número no debe superar los 10 dígitos.', confirmButtonColor: '#2C89F5' })
            return
        }
        const result = await Swal.fire({
            title: '¿Guardar cambios?',
            text: 'Se actualizará la información del usuario.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2C89F5',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
        })
        if (!result.isConfirmed) return
        try {
            setSavingEdit(true)
            await api.patch(`/admin/usuarios/${editUser.id}/`, editForm)
            await fetchUsers()
            Swal.fire({ icon: 'success', title: '¡Actualizado!', text: 'Los datos del usuario fueron guardados.', timer: 1800, showConfirmButton: false })
            setEditUser(null)
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el usuario.', confirmButtonColor: '#2C89F5' })
        } finally {
            setSavingEdit(false)
        }
    }

    const handleEditOverlayKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setEditUser(null)
        }
    }

    const getToggleIcon = (user) => {
        if (busyUserId === user.id) {
            return <ApiSpinner mode="inline" title="" />
        }
        if (user.is_active) {
            return <FiUserX size={15} />
        }
        return <FiUserCheck size={15} />
    }

    let tableRows = users.map(u => (
        <tr key={u.id} style={{ opacity: u.is_active ? 1 : 0.45 }}>
            <td style={{ paddingLeft: 24, fontWeight: 500 }}>{u.email}</td>
            <td>{u.nombre_completo}</td>
            <td className="d-none d-md-table-cell">{u.telefono || '—'}</td>
            <td>
                <span className="badge" style={{
                    background: u.role === 'admin' ? 'rgba(44,137,245,0.12)' : 'rgba(107,114,128,0.1)',
                    color: u.role === 'admin' ? '#2C89F5' : '#6b7280'
                }}>
                    {u.role === 'admin' ? 'Admin' : 'Cliente'}
                </span>
            </td>
            <td>
                <span className="badge" style={{
                    background: u.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                    color: u.is_active ? '#16a34a' : '#dc2626'
                }}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm" onClick={() => openEdit(u)} title="Editar"
                        disabled={busyUserId === u.id}
                        style={{ background: 'rgba(44,137,245,0.08)', color: '#2C89F5', borderRadius: 10 }}>
                        <FiEdit2 size={15} />
                    </button>
                    <button className="btn btn-sm" title={u.is_active ? 'Desactivar' : 'Activar'} onClick={() => toggleActive(u)} disabled={busyUserId === u.id}
                        style={{ background: u.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: u.is_active ? '#dc2626' : '#16a34a', borderRadius: 10 }}>
                        {getToggleIcon(u)}
                    </button>
                </div>
            </td>
        </tr>
    ))

    if (loading) {
        tableRows = [
            <tr key="loading"><td colSpan={6} className="text-center py-5 text-muted">
                <ApiSpinner mode="panel" title="Cargando usuarios" subtitle="Consultando la lista de usuarios registrados." compact />
            </td></tr>
        ]
    } else if (users.length === 0) {
        tableRows = [
            <tr key="empty"><td colSpan={6} className="text-center py-5 text-muted">No hay usuarios registrados.</td></tr>
        ]
    }

    return (
        <div className="container-fluid px-4 py-4 fade-in-up">
            <div className="mb-4">
                <h2 className="fw-bold text-white mb-0">Gestión de usuarios</h2>
                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Administra los usuarios del sistema</p>
            </div>

            <div className="card p-0 overflow-hidden mt-4" style={{ position: 'relative' }}>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th style={{ paddingLeft: 24 }}>Email</th>
                                <th>Nombre</th>
                                <th className="d-none d-md-table-cell">Teléfono</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>{tableRows}</tbody>
                    </table>
                </div>
            </div>

            {/* Modal editar */}
            {editUser && (
                <div
                    className="modal d-block"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    role="button"
                    tabIndex={0}
                    aria-label="Cerrar edición de usuario"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setEditUser(null)
                        }
                    }}
                    onKeyDown={handleEditOverlayKeyDown}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ padding: '32px', position: 'relative' }}>
                            {savingEdit && (
                                <ApiSpinner
                                    mode="overlay"
                                    title="Guardando usuario"
                                    subtitle="Aplicando los cambios del usuario seleccionado."
                                    compact
                                />
                            )}
                            <h5 className="fw-bold mb-1">Editar usuario</h5>
                            <p className="text-muted mb-4" style={{ fontSize: 14 }}>{editUser.email}</p>
                            <form onSubmit={saveEdit}>
                                <div className="mb-3">
                                    <label htmlFor="admin-edit-fullname" className="form-label fw-medium" style={{ fontSize: 14 }}>Nombre completo</label>
                                    <input id="admin-edit-fullname" type="text" className="form-control" value={editForm.nombre_completo}
                                        onChange={e => setEditForm({ ...editForm, nombre_completo: e.target.value })} required style={{ height: 44 }} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="admin-edit-phone" className="form-label fw-medium" style={{ fontSize: 14 }}>Teléfono</label>
                                    <input id="admin-edit-phone" type="tel" className="form-control" value={editForm.telefono} maxLength={10} inputMode="numeric"
                                        onChange={e => setEditForm({ ...editForm, telefono: e.target.value.replaceAll(/\D/g, '').slice(0, 10) })}
                                        placeholder="10 dígitos" style={{ height: 44 }} />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-medium" style={{ fontSize: 14 }} htmlFor="role">Rol</label>
                                    <select className="form-select" id="role" value={editForm.role} style={{ height: 44 }}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                                        <option value="client">Cliente</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn" onClick={() => setEditUser(null)} disabled={savingEdit}
                                        style={{ background: '#f5f5f5', color: '#666', borderRadius: 12, fontWeight: 500 }}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary-custom" disabled={savingEdit} style={{ paddingInline: 24 }}>
                                        {savingEdit ? <ApiSpinner mode="inline" title="Guardando..." /> : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminUsuarios
