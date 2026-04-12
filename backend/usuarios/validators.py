import re
from django.core.exceptions import ValidationError


def validate_secure_password(password):
    requirements = {
        'min_length': len(password) >= 12,
        'has_uppercase': bool(re.search(r'[A-Z]', password)),
        'has_lowercase': bool(re.search(r'[a-z]', password)),
        'has_number': bool(re.search(r'\d', password)),
        'has_special_char': bool(re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password)),
    }

    errors = []
    if not requirements['min_length']:
        errors.append('La contraseña debe tener al menos 12 caracteres.')
    if not requirements['has_uppercase']:
        errors.append('La contraseña debe contener al menos una mayúscula (A-Z).')
    if not requirements['has_lowercase']:
        errors.append('La contraseña debe contener al menos una minúscula (a-z).')
    if not requirements['has_number']:
        errors.append('La contraseña debe contener al menos un número (0-9).')
    if not requirements['has_special_char']:
        errors.append('La contraseña debe contener al menos un carácter especial (!@#$%^&*...).')

    if errors:
        raise ValidationError(errors)

    return True
