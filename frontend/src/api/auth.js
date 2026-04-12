export function saveTokens(access, refresh) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export function parseJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function getUser() {
  const token = getAccessToken();
  if (!token) return null;
  const payload = parseJWT(token);
  if (!payload) return null;
  return {
    id: payload.user_id,
    email: payload.email,
    nombre_completo: payload.nombre_completo,
    role: payload.role,
  };
}

export function isAdmin() {
  const user = getUser();
  return user?.role === 'admin';
}
