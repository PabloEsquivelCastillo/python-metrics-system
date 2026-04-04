import logging

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class ConflictError(exceptions.APIException):
    """Lanzar cuando la solicitud entra en conflicto con el estado actual del recurso (409)."""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'La solicitud no pudo completarse debido a un conflicto con el estado actual del recurso.'
    default_code = 'conflicto_estado'


_ERROR_CODE_MAP = {
    exceptions.ValidationError:      'error_de_validacion',
    exceptions.AuthenticationFailed: 'credenciales_invalidas',
    exceptions.NotAuthenticated:     'no_autenticado',
    exceptions.PermissionDenied:     'permiso_denegado',
    exceptions.NotFound:             'recurso_no_encontrado',
    exceptions.MethodNotAllowed:     'metodo_no_permitido',
    DjangoPermissionDenied:          'permiso_denegado',
    Http404:                         'recurso_no_encontrado',
    ConflictError:                   'conflicto_estado',
}

_DEFAULT_MESSAGES = {
    'error_de_validacion':   'La solicitud contiene datos inválidos.',
    'credenciales_invalidas': 'Las credenciales proporcionadas son incorrectas.',
    'no_autenticado':        'No se proporcionaron credenciales de autenticación.',
    'permiso_denegado':      'No tienes permiso para realizar esta acción.',
    'recurso_no_encontrado': 'El recurso solicitado no fue encontrado.',
    'conflicto_estado':      'La solicitud no pudo completarse debido a un conflicto con el estado actual del recurso.',
    'metodo_no_permitido':   'Método HTTP no permitido.',
    'eror_interno_servidor': 'Ha ocurrido un error inesperado en el servidor. Nuestro equipo ha sido notificado.',
}


def _stringify_errors(detail):
    """Convierte recursivamente ErrorDetail y estructuras anidadas a strings planos."""
    if isinstance(detail, list):
        return [_stringify_errors(item) if isinstance(item, (list, dict)) else str(item) for item in detail]
    if isinstance(detail, dict):
        return {key: _stringify_errors(value) for key, value in detail.items()}
    return str(detail)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        # Excepción no controlada → 500
        logger.exception('Error no controlado en la vista %s', context.get('view'))
        return Response(
            {
                'status': 500,
                'code': 'eror_interno_servidor',
                'message': _DEFAULT_MESSAGES['eror_interno_servidor'],
                'details': None,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Determinar el código de error a partir del tipo de excepción
    code = _ERROR_CODE_MAP.get(type(exc))

    if code is None and isinstance(exc, exceptions.APIException):
        code = getattr(exc, 'default_code', None) or 'eror_interno_servidor'

    if code is None:
        code = 'eror_interno_servidor'

    http_status = response.status_code
    message = _DEFAULT_MESSAGES.get(code, '')

    # Construir el campo details según el tipo de error
    details = None
    if code == 'error_de_validacion' and hasattr(exc, 'detail'):
        details = _stringify_errors(exc.detail) if isinstance(exc.detail, (dict, list)) else {'non_field_errors': [str(exc.detail)]}
    elif code in ('conflicto_estado', 'permiso_denegado') and hasattr(exc, 'detail'):
        raw = str(exc.detail)
        if raw and raw != _DEFAULT_MESSAGES.get(code):
            details = {'detail': raw}

    return Response(
        {
            'status': http_status,
            'code': code,
            'message': message,
            'details': details,
        },
        status=http_status,
    )
