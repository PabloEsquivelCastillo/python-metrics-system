from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from usuarios.views import RegistroView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Endpoint para refrescar el token (recibe el refresh token, devuelve un nuevo access token)
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/registro/', RegistroView.as_view(), name='registro'),


    #-------- URLS PARA SWAGGER
    # Endpoint que sirve el esquema OpenAPI (en formato JSON o YAML), NO BORRAR
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Interfaz visual de Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # Interfaz alternativa (ReDoc)
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]