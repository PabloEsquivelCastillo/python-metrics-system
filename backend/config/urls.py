from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from usuarios.views import RegistroView, LoginView, TokenRefreshCustomView, PublicKeyView

urlpatterns = [
    path('admin-django/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/public-key/', PublicKeyView.as_view(), name='public-key'),
    # Endpoint para refrescar el token (recibe el refresh token, devuelve un nuevo access token)
    path('api/token/refresh/', TokenRefreshCustomView.as_view(), name='token_refresh'),
    path('api/registro/', RegistroView.as_view(), name='registro'),


    #-------- URLS PARA SWAGGER
    # Endpoint que sirve el esquema OpenAPI (en formato JSON o YAML), NO BORRAR
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Interfaz visual de Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # Interfaz alternativa (ReDoc)
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    path('api/analysis/', include('analisis.urls')),
    path('api/', include('usuarios.urls')),
    path('api/bitacora/', include('audit.urls')),
]