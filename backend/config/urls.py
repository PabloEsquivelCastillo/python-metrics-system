from django.contrib import admin
from django.urls import path, include
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
]