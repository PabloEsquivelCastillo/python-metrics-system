# Python Metrics System

Sistema de analisis de codigo Python con arquitectura separada en:

- Backend API REST en Django + DRF
- Frontend web en React + Vite

Permite registrar usuarios, autenticar con JWT, subir archivos `.py`, calcular metricas de calidad y administrar bitacora de cambios.

## Estatus proyecto

Funcionalidades implementadas:

- Autenticacion JWT con refresh token
- Registro y login con cifrado RSA para campos sensibles
- Analisis de archivos Python por lotes
- Generacion automatica de registros en `python_analysis` y `python_metrics`
- Perfil de usuario autenticado
- Gestion de usuarios cliente para rol admin
- Creacion automatica de usuario admin inicial al ejecutar migraciones
- Bitacora con triggers en MySQL
- Documentacion OpenAPI con Swagger y ReDoc
- Paginas de error frontend (401, 403, 404, 500)

## Tecnologias

Backend:

- Python
- Django
- Django REST Framework
- MySQL
- drf-spectacular
- SimpleJWT
- Radon
- Flake8
- Loguru

Frontend:

- React
- Vite
- Axios
- React Router
- SweetAlert2

## Estructura del repositorio

```text
python-metrics-system/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   ├── usuarios/
│   ├── analisis/
│   └── audit/
└── frontend/
    ├── package.json
    └── src/
```

## Requisitos previos

- Python 3.10+
- Node.js 18+
- MySQL 8+

## Configuracion y ejecucion

## 1 Backend

Desde la raiz del repositorio:

```bash
cd backend
python -m venv .venv
```

Activar entorno virtual.

Windows (PowerShell):

```powershell
.\.venv\Scripts\Activate.ps1
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Crear archivo `.env` dentro de `backend/`:

```env
SECRET_KEY=django-insecure-tu-clave
DEBUG=True

DB_NAME=code_analysis_py
DB_USER=root
DB_PASSWORD=root
DB_HOST=127.0.0.1
DB_PORT=3306

FRONTEND_URL=http://localhost:5173
```

Crear base de datos en MySQL:

```sql
CREATE DATABASE code_analysis_py;
```

Aplicar migraciones:

```bash
python manage.py migrate
```

Al ejecutar migraciones por primera vez se crea un admin automaticamente (si no existe uno).

Variables opcionales en `backend/.env` para definir ese admin inicial:

```env
DEFAULT_ADMIN_EMAIL=admin@pythonmetrics.local
DEFAULT_ADMIN_PASSWORD=Admin123!
DEFAULT_ADMIN_NAME=Administrador General
DEFAULT_ADMIN_PHONE=0000000000
```

Si no defines estas variables, se usan esos valores por defecto. Se recomienda cambiar la contrasena despues del primer login.

Ejecutar backend:

```bash
python manage.py runserver
```

Backend disponible en:

- `http://127.0.0.1:8000/`
- Swagger: `http://127.0.0.1:8000/api/docs/`
- ReDoc: `http://127.0.0.1:8000/api/redoc/`

## 2 Frontend

En otra terminal, desde la raiz:

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en:

- `http://localhost:5173/`

Nota:

- La URL del backend esta fija en `frontend/src/api/axios.js` como `http://127.0.0.1:8000/api`.
- Si cambias host/puerto del backend, actualiza ese archivo.

Paginas de error disponibles en frontend:

- `/error/401` (no autenticado)
- `/error/403` (sin permisos)
- `/error/404` (ruta inexistente)
- `/error/500` (error de servidor)

## Endpoints principales (backend)

Autenticacion y acceso publico:

- `GET /api/public-key/`
- `POST /api/registro/`
- `POST /api/login/`
- `POST /api/token/refresh/`

Usuarios autenticados:

- `GET /api/perfil/`

Administracion de usuarios (solo admin):

- `GET /api/admin/usuarios/`
- `PATCH /api/admin/usuarios/<id>/`

Analisis de codigo:

- `POST /api/analysis/batch/upload/`
- `GET /api/analysis/`
- `GET /api/analysis/<id>/`

Bitacora (solo admin):

- `GET /api/bitacora/`
- `GET /api/bitacora/<id>/`

## Bitacora y triggers en MySQL

La app `audit` despliega triggers para auditar cambios en tablas clave y registrar eventos en `bitacora`.

Configuracion recomendada para usuario de BD de la API:

```sql
CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON code_analysis_py.* TO 'api_user'@'localhost';
GRANT TRIGGER ON code_analysis_py.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;

SET GLOBAL log_bin_trust_function_creators = 1;
```

Luego actualiza `DB_USER` y `DB_PASSWORD` en `backend/.env` segun corresponda.

## Flujo de trabajo Git sugerido

```bash
git checkout dev
git pull origin dev
git checkout -b feature/nombre-de-tu-feature
```

Al terminar:

```bash
git add .
git commit -m "feat: descripcion del cambio"
git push origin feature/nombre-de-tu-feature
```

## Notas

- No subir `backend/.env` ni entornos virtuales.
- La documentacion viva de la API debe consultarse en Swagger (`/api/docs/`).
