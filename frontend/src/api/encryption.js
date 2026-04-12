import JSEncrypt from 'jsencrypt';
import api from './axios';

let publicKeyPEM = null;

export async function getPublicKey() {
  if (!publicKeyPEM) {
    const { data } = await api.get('/public-key/');
    publicKeyPEM = data.public_key;
  }
  return publicKeyPEM;
}

/** Fuerza a re-obtener la clave pública (útil si el server reinició). */
export function clearPublicKeyCache() {
  publicKeyPEM = null;
}

export async function encryptField(value) {
  const key = await getPublicKey();
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(key);
  return encrypt.encrypt(value);
}

export async function encryptPayload(fields) {
  const result = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value) {
      result[key] = await encryptField(value);
    }
  }
  result.encrypted = true;
  return result;
}
