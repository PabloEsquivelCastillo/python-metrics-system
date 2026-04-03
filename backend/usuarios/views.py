from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
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