from django.db import connection
from rest_framework_simplejwt.authentication import JWTAuthentication


class BitacoraUsuarioMiddleware:
    """
    Middleware que intercepta cada request y, si el usuario está autenticado
    vía JWT, establece variables de sesión en MySQL para que los triggers
    puedan saber qué usuario real de la app está realizando la acción.

    Variables de sesión MySQL establecidas:
      - @app_user_email: email del usuario autenticado
      - @app_user_host: IP/host de origen del request
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user_email = None
        host = self._get_client_ip(request)

        # Intentar autenticar vía JWT sin lanzar excepción
        try:
            jwt_auth = JWTAuthentication()
            auth_result = jwt_auth.authenticate(request)
            if auth_result is not None:
                user, _ = auth_result
                user_email = getattr(user, 'email', None)
        except Exception:
            pass

        # Establecer variables de sesión en MySQL
        with connection.cursor() as cursor:
            if user_email:
                cursor.execute("SET @app_user_email = %s;", [user_email])
            else:
                cursor.execute("SET @app_user_email = NULL;")
            cursor.execute("SET @app_user_host = %s;", [host or ''])

        response = self.get_response(request)
        return response

    @staticmethod
    def _get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')
