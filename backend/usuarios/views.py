from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from loguru import logger
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import RegistroSerializer, CustomTokenObtainPairSerializer, PerfilSerializer, AdminUsuarioSerializer, IsAdmin
from .rsa_utils import get_public_key_pem, decrypt_rsa_base64


User = get_user_model()


class PublicKeyView(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        return Response({'public_key': get_public_key_pem()})


def decrypt_auth_payload(payload):
    if not payload or not payload.get('encrypted'):
        return payload

    sensitive_fields = ('email', 'password', 'nombre_completo', 'telefono')
    decrypted = {}

    for key, value in payload.items():
        if key == 'encrypted':
            continue

        if key in sensitive_fields and value is not None:
            try:
                decrypted[key] = decrypt_rsa_base64(value)
            except Exception as exc:
                raise ValidationError({key: 'No se pudo descifrar el campo.'}) from exc
        else:
            decrypted[key] = value

    if not decrypted:
        raise ValidationError({'detail': 'Payload cifrado inválido.'})
    return decrypted

class RegistroView(generics.CreateAPIView):
    queryset = User.objects.all()
    

    permission_classes = (AllowAny,)
    

    serializer_class = RegistroSerializer

    def create(self, request, *args, **kwargs):
        payload = decrypt_auth_payload(request.data)
        logger.debug(
            'Registro solicitado email={}',
            payload.get('email'),
        )
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        response = Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        logger.info(
            'Registro completado status={} email={}',
            response.status_code,
            payload.get('email'),
        )
        return response


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    # Usamos nuestro serializer personalizado que agrega el rol al token
    serializer_class = CustomTokenObtainPairSerializer 

    def post(self, request, *args, **kwargs):
        payload = decrypt_auth_payload(request.data)
        logger.debug(
            'Login solicitado username={} email={}',
            payload.get('username'),
            payload.get('email'),
        )

        email = payload.get('email')
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
            serializer = self.get_serializer(data=payload)
            serializer.is_valid(raise_exception=True)
            response = Response(serializer.validated_data, status=status.HTTP_200_OK)
            logger.info(
                'Login completado status={} username={} email={}',
                response.status_code,
                payload.get('username'),
                payload.get('email'),
            )
            return response
        except Exception as exc:
            logger.error(
                'Login fallido username={} email={} detalle={}',
                payload.get('username'),
                payload.get('email'),
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