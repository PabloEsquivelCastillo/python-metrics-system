from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from loguru import logger
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import RegistroSerializer # Asegúrate de importar tu serializador

# Obtenemos tu modelo personalizado
User = get_user_model()

class RegistroView(generics.CreateAPIView):
    # Le indicamos qué modelo va a consultar/crear
    queryset = User.objects.all()
    
    # IMPORTANTE: Permitimos que usuarios no autenticados puedan acceder a esta ruta
    permission_classes = (AllowAny,)
    
    # Le indicamos qué serializador debe usar para validar y guardar los datos
    serializer_class = RegistroSerializer

    def create(self, request, *args, **kwargs):
        logger.debug(
            'Registro solicitado email={}',
            request.data.get('email'),
        )
        response = super().create(request, *args, **kwargs)
        logger.info(
            'Registro completado status={} email={}',
            response.status_code,
            request.data.get('email'),
        )
        return response


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        logger.debug(
            'Login solicitado username={} email={}',
            request.data.get('username'),
            request.data.get('email'),
        )
        try:
            response = super().post(request, *args, **kwargs)
            logger.info(
                'Login completado status={} username={} email={}',
                response.status_code,
                request.data.get('username'),
                request.data.get('email'),
            )
            return response
        except Exception as exc:
            logger.error(
                'Login fallido username={} email={} detalle={}',
                request.data.get('username'),
                request.data.get('email'),
                str(exc),
            )
            raise
# Obtiene el token personalizado que incluye el rol del usuario para diferenciar entre CLIENT y ADMIN
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class TokenRefreshCustomView(TokenRefreshView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        logger.debug('Refresh de token solicitado')
        try:
            response = super().post(request, *args, **kwargs)
            logger.info('Refresh de token completado status={}', response.status_code)
            return response
        except Exception as exc:
            logger.error('Refresh de token fallido detalle={}', str(exc))
            raise