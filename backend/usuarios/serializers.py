from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Esto obtiene dinámicamente tu modelo 'MiUsuario' gracias al settings.py
User = get_user_model() 

class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'nombre_completo', 'password', 'telefono') # Tus nuevos campos
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['role'] = User.Role.CLIENT # Asignamos el rol CLIENT por defecto al crear un usuario
        # Como programamos el Manager arriba, create_user encriptará el password
        user = User.objects.create_user(**validated_data)
        return user

# Personalizamos el serializer de JWT para incluir información adicional en el token
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Agregar información adicional al token
        token['email'] = user.email
        token['role'] = user.role # Agregamos el rol al token para distinguir entre CLIENT y ADMIN
        return token