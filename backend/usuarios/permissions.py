from rest_framework.permissions import BasePermission

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