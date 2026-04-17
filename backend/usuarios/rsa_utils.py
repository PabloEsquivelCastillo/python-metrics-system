import base64

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa


_private_key = None
_public_key_pem = None


def _ensure_keys():
    global _private_key, _public_key_pem
    if _private_key is not None and _public_key_pem is not None:
        return

    _private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key = _private_key.public_key()
    _public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode('utf-8')


def get_public_key_pem():
    _ensure_keys()
    return _public_key_pem


def decrypt_rsa_base64(cipher_text):
    _ensure_keys()

    encrypted_bytes = base64.b64decode(cipher_text)
    decrypted_bytes = _private_key.decrypt(
        encrypted_bytes,
        padding.PKCS1v15(),
    )
    return decrypted_bytes.decode('utf-8')
