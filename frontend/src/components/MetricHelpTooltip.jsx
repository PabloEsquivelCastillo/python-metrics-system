import { useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import PropTypes from 'prop-types'

function MetricHelpTooltip({ text }) {
    const [visible, setVisible] = useState(false)

    return (
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <button
                type="button"
                aria-label="Mostrar ayuda"
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onFocus={() => setVisible(true)}
                onBlur={() => setVisible(false)}
                style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    marginLeft: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    cursor: 'help'
                }}
            >
                <FiInfo size={14} />
            </button>

            {visible && (
                <span
                    role="tooltip"
                    style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 10px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 210,
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: '#111827',
                        color: '#f9fafb',
                        fontSize: 12,
                        lineHeight: 1.45,
                        textAlign: 'left',
                        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.22)',
                        zIndex: 20
                    }}
                >
                    {text}
                </span>
            )}
        </span>
    )
}

MetricHelpTooltip.propTypes = {
    text: PropTypes.string.isRequired,
}

export default MetricHelpTooltip