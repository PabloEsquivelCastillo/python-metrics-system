import { Link } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import { isAuthenticated, isAdmin } from '../api/auth'

function ErrorState({ code, title, description, primaryTo, primaryLabel }) {
    const auth = isAuthenticated()
    const admin = isAdmin()
    const homePath = auth ? (admin ? '/admin/usuarios' : '/dashboard') : '/login'

    return (
        <section className="error-state-wrapper">
            <div className="error-state-card">
                <div>
                </div>
                <span className="error-state-code">{code}</span>
                <h1 className="error-state-title">{title}</h1>
                <p className="error-state-description">{description}</p>

                <div className="error-state-actions">
                    <Link to={primaryTo || homePath} className="btn-primary-custom error-state-btn-primary">
                        {primaryLabel || 'Volver'}
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default ErrorState
