# LocalGym

Sistema de gestión **gratuito y open source** para gimnasios locales de pequeño a
mediano tamaño, con foco en gimnasios colombianos.

Corre íntegramente en una computadora dentro del gimnasio (servidor local): opera
sin depender de internet. El staff accede desde navegadores en la red local; toda
la UI está en español y es responsive (PC, tablets y teléfonos).

## Estado

🚧 En planificación: el [product brief](docs/product-brief.md) define la visión, el
alcance del MVP y las fases del proyecto.

## Stack previsto

- **Backend**: Django 5.2 (LTS) + Django REST Framework
- **Base de datos**: SQLite
- **Frontend**: React (JavaScript) + Tailwind CSS + Vite
- **Paquetes**: pnpm · **Entorno**: venv obligatorio para el backend

## Fases

- **Fase 0** — Fundaciones: repo, CI, estructura del proyecto, guía de instalación
- **Fase 1 (MVP)** — Autenticación y roles, socios, membresías, pagos, dashboard,
  respaldo manual
- **Fase 2** — Operación diaria: recordatorios offline de vencimientos, reportes,
  backups automáticos

## Licencia

[MIT](LICENSE)
