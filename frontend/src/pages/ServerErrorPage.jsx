import ErrorState from '../components/ErrorState'

function ServerErrorPage() {
    return (
        <ErrorState
            code="500"
            title="Error interno"
            description="Ocurrio un error inesperado en el servidor. Intenta nuevamente en unos segundos."
            primaryLabel="Volver"
        />
    )
}

export default ServerErrorPage
