import ErrorState from '../components/ErrorState'

function ForbiddenPage() {
    return (
        <ErrorState
            code="403"
            title="Acceso denegado"
            description="Tu cuenta no tiene permisos para entrar a esta pagina."
            primaryLabel="Volver"
        />
    )
}

export default ForbiddenPage
