# LocalGym — Product Brief

> Documento vivo: se itera con el dueño del producto. Última actualización: 2026-10-03.

## 1. Visión

LocalGym es un sistema de gestión **gratuito y open source** para gimnasios locales
de pequeño a mediano tamaño, con foco en **gimnasios colombianos**.

Corre íntegramente en **una computadora dentro del gimnasio** que funciona como
servidor local: el sistema opera **sin depender de internet** (offline-first).
El staff accede desde navegadores dentro de la red local del gimnasio. Toda la UI
está en español.

## 2. Usuarios y roles

| Rol | Perfil | Alcance |
|---|---|---|
| Admin (dueño) | Dueño del gimnasio | Acceso total: configuración, gestión de usuarios del staff, reportes, datos |
| Recepción | Persona de recepción | Gestión diaria: socios, membresías, registro de pagos |
| Profesor | Entrenador del gimnasio | Consulta: ver socios y su estado |

Los socios **no** son usuarios del sistema: solo el staff inicia sesión; los socios
no tienen cuentas ni acceso. La matriz detallada de permisos se define con los
issues de Fase 1.

## 3. Alcance del MVP (Fase 1)

- **Autenticación y autorización**: login por usuario; roles con permisos distintos.
- **Socios (miembros)**: alta, edición, baja, búsqueda; datos de contacto.
- **Membresías**: tipos (p. ej. mensual, quincenal), asignación a socios, fechas de
  inicio y vencimiento, estados (activa / por vencer / vencida).
- **Pagos**: registro manual con método **efectivo** o **transferencia**; historial
  por socio; identificación de deudas y lista de morosos.
- **Dashboard básico**: socios activos, vencimientos próximos, ingresos del mes.
- **Respaldo manual**: exportar/importar la base de datos. Los datos viven en una
  sola PC: el sistema no debe existir sin una forma de backup.
- **UI responsive** (requisito transversal): la interfaz debe usarse en todo tipo
  de dispositivos — PC de recepción, tablets y teléfonos — desde el navegador.

## 4. Fuera de alcance (no-goals)

- Pagos online / pasarelas de pago.
- Nube / SaaS / multi-tenant (una instancia por gimnasio).
- App móvil nativa.
- Control de asistencia y gestión de clases/turnos: no son parte del producto actual.
- Acceso para socios (los socios no son usuarios del sistema).
- Multi-idioma.

## 5. Fases propuestas

### Fase 0 — Fundaciones
- Repo remoto en GitHub, licencia libre (**MIT**, decidida), README.
- Setup del GitHub Project (proyecto + milestones por fase).
- Decisiones técnicas restantes: estructura del repo (monorepo backend + frontend)
  e instalación del servidor (D3).
- Autenticación decidida: **sesión de Django (cookie)** para el SPA.
- CI básico (build + tests).

### Fase 1 — MVP: gestión esencial
Ver §3. Se desagrega en issues con criterios de aceptación al cerrar esta
planificación.

### Fase 2 — Operación diaria
- Recordatorios de vencimiento: **lista offline diaria** — el sistema muestra
  quiénes vencen pronto o vencieron; recepción llama o escribe. Sin internet
  (D4 cerrada: las notificaciones automáticas online quedan fuera).
- Reportes adicionales: cuánto se cobró por semana/mes y evolución de socios
  (activos, nuevos, dados de baja).
- Backups automáticos programados.

### Backlog futuro (sin fase)
- Multi-sede.
- PWA con caché offline para el staff.

## 6. Decisiones abiertas

| # | Decisión | Estado | Resolución |
|---|---|---|---|
| D1 | Licencia libre | ✅ Cerrada | **MIT** |
| D2 | Stack técnico | ✅ Cerrada | **Backend: Django 5.2 (LTS) + Django REST Framework · Base de datos: SQLite · Frontend: React (JavaScript) + Tailwind CSS + Vite · Paquetes: pnpm (fijado con `packageManager`) · Entorno: venv obligatorio para el backend · Linting: ESLint en el frontend** |
| D3 | Instalación del servidor | ✅ Cerrada | **Instalación en dos niveles**: (1) camino principal — instalación documentada con Python + venv + guía paso a paso + autoarranque del servidor con la PC; Django sirve la SPA compilada + la API en un solo proceso y puerto en la LAN; (2) meta posterior — empaquetado PyInstaller en modo *onedir* para instalar "copiar y doble clic". Restricción transversal: la base de datos SQLite y los backups viven en una carpeta de datos persistente, fuera del directorio de la aplicación |
| D4 | Recordatorios offline vs online | ✅ Cerrada | **Lista offline diaria**: el sistema muestra quiénes vencen pronto o vencieron; recepción llama o escribe. Sin internet |

## 7. Contexto colombiano

- Moneda: **COP** (sin decimales en uso práctico).
- Locale: **es-CO** para fechas, números y formatos.
- Métodos de pago: efectivo y transferencia (Nequi/Bancolombia/etc. van solo como
  anotación del pago, sin ninguna integración).
