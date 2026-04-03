from django.contrib.auth import get_user_model
from rest_framework import serializers

# Esto obtiene dinámicamente tu modelo 'MiUsuario' gracias al settings.py
User = get_user_model() 

class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'nombre_completo', 'password', 'telefono') # Tus nuevos campos
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Como programamos el Manager arriba, create_user encriptará el password
        user = User.objects.create_user(**validated_data)
        return user