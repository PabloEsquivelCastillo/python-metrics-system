import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import api from '../api/axios'

function AnalysisModal({ analysisId, onClose }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            try {
                const { data } = await api.get(`/analysis/${analysisId}/`)
                setData(data)
            } catch { /* interceptor handles */ }
            setLoading(false)
        }
        fetch()
    }, [analysisId])

    const qualityConfig = {
        SIMPLE: { bg: 'rgba(0,196,140,0.12)', color: '#00a676', label: 'Simple' },
        MEDIA: { bg: 'rgba(255,184,0,0.12)', color: '#cc9300', label: 'Media' },
        COMPLEJO: { bg: 'rgba(255,59,59,0.12)', color: '#dc2626', label: 'Complejo' }
    }

    if (loading) return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ padding: 40 }}>
                    <div className="text-center">
                        <span className="loading-spinner me-2" style={{ borderTopColor: '#2C89F5', borderColor: 'rgba(44,137,245,0.2)', width: 28, height: 28 }} />
                        <p className="text-muted mt-3 mb-0">Cargando análisis...</p>
                    </div>
                </div>
            </div>
        </div>
    )

    if (!data) return null

    const metrics = data.metrics?.[0] || {}
    const qc = qualityConfig[data.quality_classification] || { bg: '#f0f0f0', color: '#999', label: data.quality_classification }

    const MetricCard = ({ value, label }) => (
        <div className="col-4 mb-3">
            <div style={{ background: '#f8f9fa', borderRadius: 14, padding: '16px 8px' }}>
                <h4 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>{value ?? '—'}</h4>
                <small className="text-muted" style={{ fontSize: 11 }}>{label}</small>
            </div>
        </div>
    )

    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
                <div className="modal-content" style={{ padding: '32px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 className="fw-bold mb-2" style={{ fontSize: '1.1rem' }}>{data.file_name}</h5>
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <span className="badge" style={{ background: qc.bg, color: qc.color }}>
                                    {qc.label}
                                </span>
                                <small style={{ color: '#9ca3af' }}>{data.file_size_kb} KB</small>
                                <small style={{ color: '#9ca3af' }}>
                                    {data.analysis_date ? new Date(data.analysis_date).toLocaleDateString('es-MX') : ''}
                                </small>
                            </div>
                        </div>
                        <button className="btn btn-sm" onClick={onClose}
                            style={{ background: '#f5f5f5', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                            <FiX size={18} color="#666" />
                        </button>
                    </div>

                    <hr style={{ borderColor: '#f0f0f0' }} />

                    <h6 className="fw-bold text-uppercase mb-2" style={{ fontSize: 12, color: '#9ca3af', letterSpacing: '0.05em' }}>Resumen</h6>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#4b5563' }}>{data.analysis_summary || 'Sin resumen disponible.'}</p>

                    <hr style={{ borderColor: '#f0f0f0' }} />

                    <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: 12, color: '#9ca3af', letterSpacing: '0.05em' }}>Métricas</h6>
                    <div className="row text-center g-2">
                        <MetricCard value={metrics.lines_of_code} label="Líneas de código" />
                        <MetricCard value={metrics.cyclomatic_complexity} label="Complejidad ciclomática" />
                        <MetricCard value={metrics.functions_count} label="Funciones" />
                        <MetricCard value={metrics.classes_count} label="Clases" />
                        <MetricCard value={metrics.imports_count} label="Imports" />
                        <MetricCard value={metrics.pep8_violations} label="Violaciones PEP8" />
                    </div>

                    <div className="text-end mt-3">
                        <button className="btn" onClick={onClose}
                            style={{ background: '#f5f5f5', color: '#666', borderRadius: 12, fontWeight: 500, paddingInline: 20 }}>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalysisModal
