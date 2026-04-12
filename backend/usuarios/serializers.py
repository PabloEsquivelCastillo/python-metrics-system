from rest_framework import serializers
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Serializer personalizado para agregar el rol al JWT
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

# Serializer para el registro de usuarios
class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'nombre_completo', 'telefono', 'password', 'role']
        read_only_fields = ['id']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

# Serializer para el perfil del usuario autenticado
class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'nombre_completo', 'telefono', 'role']
        read_only_fields = ['id', 'email', 'role']

# Serializer para la gestión de usuarios (admin)
class AdminUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'nombre_completo', 'telefono', 'role', 'is_active']
        read_only_fields = ['id', 'email']

# Valida que el usuario autenticado tenga el rol de administrador
class IsAdmin(BasePermission):
    message = 'Acceso restringido a administradores.'
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )
# Valida que el usuario autenticado tenga el rol de cliente
class IsClient(BasePermission):
    message = 'Acceso restringido a clientes.'
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'client'
        )
# Valida que el usuario autenticado tenga el rol de administrador o cliente
class IsAdminOrClient(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['admin', 'client']
        )