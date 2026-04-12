from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from loguru import logger
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import RegistroSerializer, CustomTokenObtainPairSerializer, PerfilSerializer, AdminUsuarioSerializer, IsAdmin

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
    # Usamos nuestro serializer personalizado que agrega el rol al token
    serializer_class = CustomTokenObtainPairSerializer 

    def post(self, request, *args, **kwargs):
        logger.debug(
            'Login solicitado username={} email={}',
            request.data.get('username'),
            request.data.get('email'),
        )
        # Verificar si la cuenta existe pero está desactivada
        email = request.data.get('email')
        if email:
            try:
                user = User.objects.get(email=email)
                if not user.is_active:
                    logger.warning('Login rechazado cuenta_desactivada email={}', email)
                    return Response(
                        {'detail': 'Tu cuenta ha sido desactivada. Contacta al administrador.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except User.DoesNotExist:
                pass

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


class PerfilView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PerfilSerializer

    def get_object(self):
        return self.request.user


class AdminUsuarioListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUsuarioSerializer

    def get_queryset(self):
        return User.objects.filter(role='client').order_by('id')


class AdminUsuarioDetailView(generics.UpdateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUsuarioSerializer

    def get_queryset(self):
        return User.objects.filter(role='client').exclude(pk=self.request.user.pk)