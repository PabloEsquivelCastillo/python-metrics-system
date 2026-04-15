import { useState, useEffect, useCallback } from 'react'
import { FiEye, FiSearch, FiX, FiClipboard } from 'react-icons/fi'
import api from '../api/axios'
import ApiSpinner from '../components/ApiSpinner'

function AdminBitacora() {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [detail, setDetail] = useState(null)
    const [filters, setFilters] = useState({ nombre_dato: '', tipo_movimiento: '', usuario: '', fecha_desde: '', fecha_hasta: '' })

    const fetchRecords = useCallback(async () => {
        setLoading(true)
        try {
            const params = {}
            Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
            const { data } = await api.get('/bitacora/', { params })
            setRecords(data)
        } catch { /* interceptor handles */ }
        setLoading(false)
    }, [filters])

    useEffect(() => { fetchRecords() }, [fetchRecords])

    const clearFilters = () => setFilters({ nombre_dato: '', tipo_movimiento: '', usuario: '', fecha_desde: '', fecha_hasta: '' })

    const formatDate = (d) => d ? new Date(d).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' }) : '-'

    const movBadge = (tipo) => {
        const m = {
            INSERT: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
            UPDATE: { bg: 'rgba(255,184,0,0.12)', color: '#cc9300' },
            DELETE: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' }
        }
        const c = m[tipo] || { bg: '#f0f0f0', color: '#999' }
        return <span className="badge" style={{ background: c.bg, color: c.color }}>{tipo}</span>
    }

    const handleDetailOverlayKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setDetail(null)
        }
    }

    let tableRows = records.map(r => (
        <tr key={r.bitacora_id}>
            <td style={{ paddingLeft: 24 }}>{r.bitacora_id}</td>
            <td className="text-nowrap">{formatDate(r.fecha_hora)}</td>
            <td>{r.nombre_dato}</td>
            <td>{movBadge(r.tipo_movimiento)}</td>
            <td><span className="text-truncate d-inline-block" style={{ maxWidth: 200 }}>{r.accion}</span></td>
            <td>{r.es_accion_bd ? <span className="text-muted">{r.usuario_bd}</span> : r.usuario}</td>
            <td>
                <span className="badge" style={r.es_accion_bd
                    ? { background: 'rgba(30,30,30,0.12)', color: '#333' }
                    : { background: 'rgba(44,137,245,0.12)', color: '#2C89F5' }}>
                    {r.es_accion_bd ? 'BD' : 'API'}
                </span>
            </td>
            <td>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setDetail(r)}>
                    <FiEye size={14} />
                </button>
            </td>
        </tr>
    ))

    if (loading) {
        tableRows = [
            <tr key="loading"><td colSpan={8} className="text-center py-5">
                <ApiSpinner mode="panel" title="Cargando bitácora" subtitle="Consultando el historial de operaciones registradas." compact />
            </td></tr>
        ]
    } else if (records.length === 0) {
        tableRows = [
            <tr key="empty"><td colSpan={8} className="text-center py-5">
                <FiClipboard size={32} className="text-muted mb-2" />
                <div className="text-muted">No hay registros.</div>
            </td></tr>
        ]
    }

    return (
        <div className="container-fluid px-4 py-4 fade-in-up">
            <div className="mb-4">
                <h2 className="fw-bold text-white mb-0">Bitácora</h2>
                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Registro de acciones del sistema</p>
            </div>

            {/* Filtros */}
            <div className="card mb-4 p-3" style={{ position: 'relative' }}>
                <div className="row g-2 align-items-end">
                    <div className="col-md-2">
                        <label htmlFor="bitacora-nombre-dato" className="form-label small fw-medium">Tabla</label>
                        <input id="bitacora-nombre-dato" type="text" className="form-control form-control-sm" placeholder="Ej: usuarios"
                            value={filters.nombre_dato} onChange={e => setFilters(f => ({ ...f, nombre_dato: e.target.value }))} />
                    </div>
                    <div className="col-md-2">
                        <label htmlFor="bitacora-movimiento" className="form-label small fw-medium">Movimiento</label>
                        <select id="bitacora-movimiento" className="form-select form-select-sm" value={filters.tipo_movimiento}
                            onChange={e => setFilters(f => ({ ...f, tipo_movimiento: e.target.value }))}>
                            <option value="">Todos</option>
                            <option value="INSERT">INSERT</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label htmlFor="bitacora-usuario" className="form-label small fw-medium">Usuario</label>
                        <input id="bitacora-usuario" type="text" className="form-control form-control-sm" placeholder="email o usuario BD"
                            value={filters.usuario} onChange={e => setFilters(f => ({ ...f, usuario: e.target.value }))} />
                    </div>
                    <div className="col-md-2">
                        <label htmlFor="bitacora-fecha-desde" className="form-label small fw-medium">Desde</label>
                        <input id="bitacora-fecha-desde" type="date" className="form-control form-control-sm" value={filters.fecha_desde}
                            onChange={e => setFilters(f => ({ ...f, fecha_desde: e.target.value }))} />
                    </div>
                    <div className="col-md-2">
                        <label htmlFor="bitacora-fecha-hasta" className="form-label small fw-medium">Hasta</label>
                        <input id="bitacora-fecha-hasta" type="date" className="form-control form-control-sm" value={filters.fecha_hasta}
                            onChange={e => setFilters(f => ({ ...f, fecha_hasta: e.target.value }))} />
                    </div>
                    <div className="col-md-2 d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters} title="Limpiar"><FiX size={16} /></button>
                        <button className="btn btn-sm d-inline-flex align-items-center gap-2" style={{ background: '#2C89F5', color: 'white' }} onClick={fetchRecords} disabled={loading}>
                            {loading ? <ApiSpinner mode="inline" title="Buscando..." /> : <><FiSearch size={16} /> Buscar</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card p-0 overflow-hidden" style={{ position: 'relative' }}>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle" style={{ fontSize: 14 }}>
                        <thead className="table-light">
                            <tr>
                                <th style={{ paddingLeft: 24 }}>ID</th>
                                <th>Fecha</th>
                                <th>Tabla</th>
                                <th>Movimiento</th>
                                <th>Acción</th>
                                <th>Usuario</th>
                                <th>Origen</th>
                                <th>Ver</th>
                            </tr>
                        </thead>
                        <tbody>{tableRows}</tbody>
                    </table>
                </div>
            </div>

            {/* Modal detalle */}
            {detail && (
                <div
                    className="modal d-block"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                    role="button"
                    tabIndex={0}
                    aria-label="Cerrar detalle"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setDetail(null)
                        }
                    }}
                    onKeyDown={handleDetailOverlayKeyDown}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-bold mb-0">Detalle #{detail.bitacora_id}</h5>
                                <button className="btn-close" onClick={() => setDetail(null)} />
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-sm-6"><strong>Tabla:</strong> {detail.nombre_dato}</div>
                                <div className="col-sm-6"><strong>Movimiento:</strong> {movBadge(detail.tipo_movimiento)}</div>
                                <div className="col-sm-6"><strong>Usuario:</strong> {detail.es_accion_bd ? detail.usuario_bd : detail.usuario}</div>
                                <div className="col-sm-6"><strong>Origen:</strong> {detail.es_accion_bd ? 'Base de datos' : 'API'}</div>
                                <div className="col-sm-6"><strong>Host:</strong> {detail.host_origen || '-'}</div>
                                <div className="col-sm-6"><strong>Fecha:</strong> {formatDate(detail.fecha_hora)}</div>
                                <div className="col-12"><strong>Acción:</strong> {detail.accion}</div>
                            </div>
                            {detail.valor_antes && (
                                <div className="mb-3">
                                    <strong>Valores anteriores:</strong>
                                    <pre className="bg-light rounded p-3 mt-1 mb-0" style={{ maxHeight: 200, overflow: 'auto', fontSize: 13 }}>
                                        {JSON.stringify(detail.valor_antes, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {detail.valor_despues && (
                                <div className="mb-3">
                                    <strong>Valores nuevos:</strong>
                                    <pre className="bg-light rounded p-3 mt-1 mb-0" style={{ maxHeight: 200, overflow: 'auto', fontSize: 13 }}>
                                        {JSON.stringify(detail.valor_despues, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminBitacora
