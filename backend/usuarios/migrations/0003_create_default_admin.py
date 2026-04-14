import os

from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_default_admin(apps, schema_editor):
    MiUsuario = apps.get_model('usuarios', 'MiUsuario')

    default_email = os.getenv('DEFAULT_ADMIN_EMAIL', 'admin@pythonmetrics.local').strip().lower()
    default_password = os.getenv('DEFAULT_ADMIN_PASSWORD', 'Admin123!')
    default_name = os.getenv('DEFAULT_ADMIN_NAME', 'Administrador General').strip()
    default_phone = os.getenv('DEFAULT_ADMIN_PHONE', '0000000000').strip()[:10]

    if MiUsuario.objects.filter(role='admin').exists():
        return

    existing_user = MiUsuario.objects.filter(email=default_email).first()
    if existing_user:
        existing_user.role = 'admin'
        existing_user.is_staff = True
        existing_user.is_superuser = True
        existing_user.is_active = True
        if not existing_user.nombre_completo:
            existing_user.nombre_completo = default_name
        if not existing_user.telefono:
            existing_user.telefono = default_phone
        existing_user.password = make_password(default_password)
        existing_user.save()
        return

    MiUsuario.objects.create(
        email=default_email,
        nombre_completo=default_name,
        telefono=default_phone,
        role='admin',
        is_staff=True,
        is_superuser=True,
        is_active=True,
        password=make_password(default_password),
    )


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0002_miusuario_role_alter_miusuario_telefono'),
    ]

    operations = [
        migrations.RunPython(create_default_admin, migrations.RunPython.noop),
    ]
