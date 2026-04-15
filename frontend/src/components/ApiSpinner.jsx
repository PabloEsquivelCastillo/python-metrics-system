import { FaPython } from 'react-icons/fa'
import PropTypes from 'prop-types'

function ApiSpinner({
    title = 'Cargando...',
    subtitle = 'Espera un momento mientras termina la solicitud.',
    mode = 'panel',
    light = false,
    compact = false
}) {
    if (mode === 'inline') {
        return (
            <span className={`api-spinner-inline ${light ? 'api-spinner-inline--light' : ''}`}>
                <span className="api-spinner-inline__visual" aria-hidden="true">
                    <span className="api-spinner-inline__ring" />
                    <FaPython className="api-spinner-inline__icon" size={14} />
                </span>
                <span>{title}</span>
            </span>
        )
    }

    return (
        <div className={`api-spinner-shell api-spinner-shell--${mode}`} aria-live="polite">
            <div className={`api-spinner-card ${compact ? 'api-spinner-card--compact' : ''}`}>
                <div className="api-spinner-visual" aria-hidden="true">
                    <span className="api-spinner-ring api-spinner-ring--outer" />
                    <span className="api-spinner-ring api-spinner-ring--inner" />
                    <span className="api-spinner-glow" />
                    <FaPython className={`api-spinner-icon ${light ? 'api-spinner-icon--light' : ''}`} size={compact ? 24 : 32} />
                </div>
                <div className="api-spinner-copy">
                    <output className={`api-spinner-title ${light ? 'api-spinner-title--light' : ''}`}>{title}</output>
                    {subtitle && <div className={`api-spinner-subtitle ${light ? 'api-spinner-subtitle--light' : ''}`}>{subtitle}</div>}
                </div>
            </div>
        </div>
    )
}

ApiSpinner.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    mode: PropTypes.oneOf(['inline', 'panel', 'overlay', 'fullscreen']),
    light: PropTypes.bool,
    compact: PropTypes.bool,
}

export default ApiSpinner