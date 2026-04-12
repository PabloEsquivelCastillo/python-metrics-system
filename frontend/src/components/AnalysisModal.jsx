import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import api from '../api/axios'
import MetricHelpTooltip from './MetricHelpTooltip'
import ApiSpinner from './ApiSpinner'

const metricHelpTexts = {
    lines_of_code: 'Cantidad total de líneas detectadas en el archivo. Ayuda a estimar tamaño, pero no por sí sola la calidad del código.',
    cyclomatic_complexity: 'Mide cuántos caminos lógicos tiene el código. Mientras más alta sea, más difícil suele ser entender, probar y mantener ese flujo.',
    functions_count: 'Número de funciones definidas en el archivo. Sirve para identificar si la lógica está separada o concentrada en pocos bloques.',
    classes_count: 'Número de clases declaradas. Da contexto sobre cómo está organizada la solución y si usa estructuras orientadas a objetos.',
    imports_count: 'Cantidad de imports utilizados para traer módulos o dependencias. Un exceso puede indicar acoplamiento o dependencias innecesarias.',
    pep8_violations: 'Número de incumplimientos al estilo PEP8. Menos violaciones normalmente implica código más consistente y fácil de revisar.'
}

function extractSection(text, startLabel, endLabel) {
    const startIndex = startLabel ? text.indexOf(startLabel) : 0
    if (startIndex === -1) return ''

    const contentStart = startLabel ? startIndex + startLabel.length : startIndex
    const endIndex = endLabel ? text.indexOf(endLabel, contentStart) : -1
    const content = endIndex === -1 ? text.slice(contentStart) : text.slice(contentStart, endIndex)
    return content.trim()
}

function splitSentences(text) {
    return text
        .split(/\.\s+(?=[A-ZÁÉÍÓÚÑ])/)
        .map(sentence => sentence.trim().replace(/\.$/, ''))
        .filter(Boolean)
}

function buildSummarySections(summary) {
    if (!summary) return null

    const overview = extractSection(summary, '', 'Estructura:')
    const structure = extractSection(summary, 'Estructura:', 'Violaciones PEP8:')
    const pep8 = extractSection(summary, 'Violaciones PEP8:', 'Detalle:')
    const detail = extractSection(summary, 'Detalle:', 'Recomendaciones:')
    const recommendations = extractSection(summary, 'Recomendaciones:', '')

    return {
        overview: splitSentences(overview),
        structure,
        pep8,
        detail: detail.split('|').map(item => item.trim()).filter(Boolean),
        recommendations: splitSentences(recommendations)
    }
}

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
                <div className="modal-content" style={{ padding: 24 }}>
                    <ApiSpinner
                        mode="panel"
                        title="Cargando detalle del análisis"
                        subtitle="Estamos recuperando el resumen y las métricas del archivo seleccionado."
                        compact
                    />
                </div>
            </div>
        </div>
    )

    if (!data) return null

    const metrics = data.metrics?.[0] || {}
    const qc = qualityConfig[data.quality_classification] || { bg: '#f0f0f0', color: '#999', label: data.quality_classification }
    const summarySections = buildSummarySections(data.analysis_summary)

    const MetricCard = ({ value, label, helpText }) => (
        <div className="col-4 mb-3">
            <div style={{ background: '#f8f9fa', borderRadius: 14, padding: '16px 8px' }}>
                <h4 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>{value ?? '—'}</h4>
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 28 }}>
                    <small className="text-muted" style={{ fontSize: 11 }}>{label}</small>
                    <MetricHelpTooltip text={helpText} />
                </div>
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
                    {summarySections ? (
                        <div style={{ fontSize: 14, lineHeight: 1.6, color: '#4b5563' }}>
                            {summarySections.overview.length > 0 && (
                                <div className="mb-3">
                                    {summarySections.overview.map((item) => (
                                        <p key={item} className="mb-1">{item}</p>
                                    ))}
                                </div>
                            )}

                            <div className="row g-2 mb-3">
                                <div className="col-md-6">
                                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: '14px 16px', height: '100%' }}>
                                        <div className="fw-semibold mb-1" style={{ color: '#1f2937' }}>Estructura</div>
                                        <p className="mb-0">{summarySections.structure || 'Sin información estructural disponible.'}</p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: '14px 16px', height: '100%' }}>
                                        <div className="fw-semibold mb-1" style={{ color: '#1f2937' }}>PEP8 y mantenibilidad</div>
                                        <p className="mb-0">{summarySections.pep8 || 'Sin detalles de estilo disponibles.'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="fw-semibold mb-2" style={{ color: '#1f2937' }}>Detalle de hallazgos</div>
                                {summarySections.detail.length > 0 ? (
                                    <ul className="mb-0 ps-3">
                                        {summarySections.detail.map((item) => (
                                            <li key={item} className="mb-1">{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mb-0">No se reportaron hallazgos específicos.</p>
                                )}
                            </div>

                            <div>
                                <div className="fw-semibold mb-2" style={{ color: '#1f2937' }}>Recomendaciones</div>
                                {summarySections.recommendations.length > 0 ? (
                                    <ul className="mb-0 ps-3">
                                        {summarySections.recommendations.map((item) => (
                                            <li key={item} className="mb-1">{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mb-0">Sin recomendaciones adicionales.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: 14, lineHeight: 1.7, color: '#4b5563' }}>Sin resumen disponible.</p>
                    )}

                    <hr style={{ borderColor: '#f0f0f0' }} />

                    <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: 12, color: '#9ca3af', letterSpacing: '0.05em' }}>Métricas</h6>
                    <div className="row text-center g-2">
                        <MetricCard value={metrics.lines_of_code} label="Líneas de código" helpText={metricHelpTexts.lines_of_code} />
                        <MetricCard value={metrics.cyclomatic_complexity} label="Complejidad ciclomática" helpText={metricHelpTexts.cyclomatic_complexity} />
                        <MetricCard value={metrics.functions_count} label="Funciones" helpText={metricHelpTexts.functions_count} />
                        <MetricCard value={metrics.classes_count} label="Clases" helpText={metricHelpTexts.classes_count} />
                        <MetricCard value={metrics.imports_count} label="Imports" helpText={metricHelpTexts.imports_count} />
                        <MetricCard value={metrics.pep8_violations} label="Violaciones PEP8" helpText={metricHelpTexts.pep8_violations} />
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
