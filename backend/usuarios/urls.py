from django.urls import path
from .views import PerfilView, AdminUsuarioListView, AdminUsuarioDetailView

urlpatterns = [
    path('perfil/', PerfilView.as_view(), name='perfil'),
    path('admin/usuarios/', AdminUsuarioListView.as_view(), name='admin-usuarios-list'),
    path('admin/usuarios/<int:pk>/', AdminUsuarioDetailView.as_view(), name='admin-usuarios-detail'),
]
