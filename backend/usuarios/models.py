from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# 1. El Manager: Le dice a Django cómo crear usuarios normales y superusuarios
class MiUsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password) # ¡Esto encripta la contraseña!
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

# 2. El Modelo: Tu tabla personalizada
class MiUsuario(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True) # Usaremos esto para el login
    nombre_completo = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    
    # Campos obligatorios para que el admin de Django funcione bien
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = MiUsuarioManager()

    USERNAME_FIELD = 'email' # Le decimos a Django que el login es con email
    REQUIRED_FIELDS = ['nombre_completo'] # Campos extra al hacer createsuperuser

    def __str__(self):
        return self.email