# LocalGym

Sistema de gestión **gratuito y open source** para gimnasios locales de pequeño a
mediano tamaño, con foco en gimnasios colombianos.

Corre íntegramente en una computadora dentro del gimnasio (servidor local): opera
sin depender de internet. El staff accede desde navegadores en la red local; toda
la UI está en español y es responsive (PC, tablets y teléfonos).

## Estado

🚧 **Fase 0 en curso**: estructura del monorepo lista (backend Django + frontend
React). Pendiente: CI básico (issue #2) y guía de instalación completa. El
[product brief](docs/product-brief.md) define la visión, el alcance del MVP y las
fases del proyecto.

## Stack

- **Backend**: Django 5.2 (LTS) + Django REST Framework
- **Base de datos**: SQLite en una carpeta de datos persistente, fuera del
  directorio de la aplicación
- **Frontend**: React 19 (JavaScript) + Tailwind CSS + Vite
- **Paquetes**: pnpm (versión fijada con `packageManager`) · **Entorno**: venv
  obligatorio para el backend
- **Linting**: ESLint en el frontend

## Estructura del monorepo

```text
LocalGym/
├── backend/              # API: Django 5.2 + DRF
│   ├── config/           # Proyecto Django (settings, urls, wsgi/asgi)
│   ├── .env.example      # Plantilla de variables (el .env real va fuera de git)
│   ├── manage.py
│   └── requirements.txt  # Dependencias Python, versiones fijadas
├── frontend/             # SPA: React + Vite + Tailwind (pnpm)
│   ├── src/
│   ├── index.html
│   └── package.json      # pnpm fijado vía "packageManager"
├── docs/                 # Documentación del producto (brief)
├── data/                 # DB SQLite y respaldos (persistente, fuera de git)
├── odd/                  # Tracking del flujo de trabajo (desarrollo)
├── README.md
└── LICENSE
```

`backend/.venv/`, `frontend/node_modules/` y `data/` viven fuera de git: la base
de datos y los respaldos deben sobrevivir a actualizaciones de la aplicación.

## Estrategia de ramas

| Rama | Rol |
|---|---|
| `main` | Estable / releasable. Solo recibe cambios vía PR, y solo cuando el dueño lo pide. Protegida: PR obligatorio. |
| `dev` | Integración. Las ramas de issue se crean desde acá. |
| `issue/N-slug` | Una rama por issue, creada desde `dev` (ej: `issue/1-monorepo-structure`). |

- El CI corre en pushes y PRs a `dev` y a `main` (se configura en la issue #2).
- Los status checks requeridos en `main` se agregan cuando el CI exista.
- Sin flujo formal de hotfixes por ahora (MVP): los fixes salen de `dev`.

## Puesta en marcha (desarrollo)

**Backend** — desde la raíz del repo:

```bash
python -m venv backend/.venv
# Windows:
backend/.venv/Scripts/pip install -r backend/requirements.txt
# Variables de entorno: copiar la plantilla y generar una SECRET_KEY propia
cp backend/.env.example backend/.env
backend/.venv/Scripts/python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
# Pegar el valor en backend/.env (LOCALGYM_SECRET_KEY)
backend/.venv/Scripts/python backend/manage.py migrate
backend/.venv/Scripts/python backend/manage.py runserver
# Linux/macOS: usar backend/.venv/bin/ en lugar de Scripts/
```

El backend **no arranca sin `LOCALGYM_SECRET_KEY`**: no hay clave por defecto a
propósito, porque una clave conocida públicamente permitiría falsificar sesiones
y firmas. Las variables se leen de `backend/.env` o del entorno:

| Variable | Obligatoria | Por defecto | Para qué |
|---|---|---|---|
| `LOCALGYM_SECRET_KEY` | Sí | — (falla al arrancar) | Firma de sesiones y tokens |
| `LOCALGYM_DEBUG` | No | `False` | `True` solo en desarrollo: muestra páginas de error detalladas |
| `LOCALGYM_DATA_DIR` | No | `<raíz del repo>/data` | Carpeta persistente de datos y respaldos |

La base de datos vive en `data/db.sqlite3`: carpeta de datos persistente fuera
del directorio de la aplicación. En instalaciones de producción se sobreescribe
con la variable de entorno `LOCALGYM_DATA_DIR`.

**Frontend**:

```bash
cd frontend
pnpm install
pnpm dev
```

## Fases

- **Fase 0** — Fundaciones: repo, CI, estructura del proyecto, guía de instalación
- **Fase 1 (MVP)** — Autenticación y roles, socios, membresías, pagos, dashboard,
  respaldo manual
- **Fase 2** — Operación diaria: recordatorios offline de vencimientos, reportes,
  backups automáticos

## Licencia

[MIT](LICENSE)
