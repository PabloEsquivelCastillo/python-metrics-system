import ErrorState from '../components/ErrorState'

function UnauthorizedPage() {
    return (
        <ErrorState
            code="401"
            title="Sesion no valida"
            description="Necesitas iniciar sesion para acceder a esta seccion."
            primaryTo="/login"
            primaryLabel="Volver a login"
        />
    )
}

export default UnauthorizedPage
