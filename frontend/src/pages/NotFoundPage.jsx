import ErrorState from '../components/ErrorState'

function NotFoundPage() {
    return (
        <ErrorState
            code="404"
            title="Pagina no encontrada"
            description="La ruta que intentas abrir no existe o fue movida."
        />
    )
}

export default NotFoundPage
