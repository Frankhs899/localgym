# Feature: auth-roles — LocalGym issue #4

Implement Django session authentication and role authorization for LocalGym on branch `issue/4-auth-roles`, delivered to `dev` as one PR when the owner authorizes delivery.
Backend: Django 5.2 + Django REST Framework; frontend: React 19 + Vite. Verification uses `backend/.venv/Scripts/python backend/manage.py test`, `backend/.venv/Scripts/ruff check backend`, `pnpm --dir frontend run lint`, `pnpm --dir frontend run build`, and a browser flow check with Playwright.

## Specs

The source of truth is GitHub issue #4 (https://github.com/Frankhs899/localgym/issues/4). Its exact acceptance strings are preserved here.

- **S1** — "`accounts.User` con `role` (admin/recepción/profesor), nombre y apellido requeridos (email opcional), y `AUTH_USER_MODEL` configurado antes de la primera migración propia"
- **S2** — "Sesión por Django: `POST /api/auth/login/`, `POST /api/auth/logout/`, `GET /api/me/` (devuelve usuario y rol; 404 sin sesión)"
- **S3** — "`PUT /api/me/password/`: cambia la contraseña propia verificando la actual"
- **S4** — "Contrato 404: endpoint de negocio sin sesión o sin permiso → 404; 403 solo por fallo de CSRF"
- **S5** — "CSRF: write sin `X-CSRFToken` válido → 403; con header válido → pasa"
- **S6** — "Tests del contrato por rol y recurso según la matriz (vistas de prueba montadas solo en tests)"
- **S7** — "Staff gestionable desde Django admin: alta con username/nombre/apellido/rol/contraseña, rol visible y editable, `is_staff` solo para el dueño"
- **S8** — "Página de login (usuario/contraseña, errores visibles en español)"
- **S9** — "Shell: layout con menú según rol, usuario logueado por nombre y apellido, logout"
- **S10** — "Guardas de ruta: rutas solo accesibles para roles con permiso; pantalla \"sin permiso\""
- **S11** — "Ante 404 en una llamada de datos: sondeo `/api/me/` → si también 404, logout y volver al login"
- **S12** — "Form \"Mi perfil\" para cambiar la contraseña propia"
- **S13** — "Responsive (requisito transversal del brief): usable en PC, tablets y teléfonos"
- **S14** — "Matriz de permisos documentada en el repo (`docs/`)"
- **S15** — "Login por usuario con **sesión de Django (cookie)** (decisión D2 del brief) y roles con permisos distintos: **admin (dueño)**, **recepción**, **profesor**. Los socios no son usuarios del sistema: solo el staff inicia sesión."
- **S16** — "El admin gestiona los usuarios del staff (crear, editar, desactivar, resetear contraseña) desde Django admin (`/admin/`); en la SPA, cualquier rol puede cambiar su propia contraseña (\"Mi perfil\")."
- **S17** — "Recuperación de contraseña: sin internet no hay email. El admin resetea la contraseña desde `/admin/` y el staff la cambia desde \"Mi perfil\". Cero flujos de email o preguntas de seguridad."
- **S18** — "Frontend: login + shell completo con navegación por rol (layout, menú según rol, guardas de ruta, pantalla \"sin permiso\", cliente API con sesión + CSRF). Sin pantallas CRUD: llegan con #5-#9."
- **S19** — "Los endpoints de negocio responden **404** ante sesión ausente/vencida o falta de permiso (indistinguible de un recurso inexistente). Solo los endpoints de sesión tienen comportamiento definido sin sesión: `POST /api/auth/login/`, `POST /api/auth/logout/`, cookie csrf, y `GET /api/me/` (200 con usuario+rol, o 404 sin sesión). 403 queda reservado a fallo de CSRF. El SPA distingue sesión vencida sondeando `/api/me/`."
- **S20** — "CSRF: patrón estándar de Django para SPA — cookie `csrftoken` legible por JS + header `X-CSRFToken` en cada write (POST/PUT/PATCH/DELETE). SPA en el mismo origen: cero CORS."
- **S21** — "Transporte: HTTP plano en la LAN del gimnasio, riesgo aceptado y documentado como limitación conocida (endurecible más adelante)."
- **S22** — "Datos del staff: alta mínima productiva — requeridos `username`, nombre y apellido, contraseña y rol; email opcional (sin uso real: no hay internet ni flujos de email); campo de teléfono; sin dirección (agregable después si hace falta). La UI muestra nombre y apellido reales, no el username. `is_staff=True` (acceso a `/admin/`) solo para el dueño."
- **S23** — "Atribución de registros: los registros de negocio guardan quién los hizo y cuándo se hizo — `created_by` (FK al usuario logueado, automático) y la fecha/hora de creación (automática) en socios y pagos, visible en el detalle. Lo aplican #5 y #7 al construirse."
- **S24** — Matrix de permisos (contrato para toda la Fase 1): "Socios | Admin: CRUD | Recepción: CRUD | Profesor: Solo lectura (+ estado de membresía)"; "Membresías | Admin: CRUD | Recepción: CRUD | Profesor: —"; "Pagos | Admin: CRUD | Recepción: CRUD | Profesor: —"; "Dashboard | Admin: Sí | Recepción: Sí | Profesor: —"; "Respaldos | Admin: Sí | Recepción: — | Profesor: —"; "Staff (usuarios) | Admin: CRUD (vía `/admin/`) | Recepción: — | Profesor: —"; "Mi perfil (contraseña propia) | Admin: ✓ | Recepción: ✓ | Profesor: ✓".
- **S25** — "Los recursos de negocio aún no existen: esta issue entrega el **mecanismo de enforcement** (modelo de roles, capa de permisos, contrato 404) verificado con tests; cada issue de Fase 1 aplica la matriz a sus recursos al construirse."
- **S26** — Out of scope: "Pantallas CRUD de socios/membresías/pagos (#5-#7), dashboard (#8), respaldos (#9)"; "La FK `created_by` se agrega a socios (#5) y pagos (#7), no en esta issue"; "Gestión de staff desde la SPA (queda en Django admin)"; "TLS en la LAN (documentado como limitación conocida)".

## Tasks

- **T1** (S1, S7, S22) — Add the `accounts` app, custom `User`, initial migration, admin integration, and role-aware staff management. Route: inline. Status: pending — feature document reviewed; implementation resumes in the next session. Commit: `feat(accounts): add role-based staff users`.
- **T2** (S2, S3, S5, S15, S17-S20) — Add session authentication endpoints, self-profile password change, CSRF cookie/header contract, and API error behavior. Route: inline. Status: pending. Commit: `feat(api): add session authentication endpoints`.
- **T3** (S4, S6, S24, S25) — Add reusable role authorization and contract tests backed by test-only resource views. Route: inline. Status: pending. Commit: `feat(accounts): enforce role permissions`.
- **T4** (S8-S13, S18-S20) — Replace the Vite template with the Spanish responsive SPA: login, auth context/client, role-aware shell, route guards, session reconciliation, and profile form. Route: delegated writer, disjoint frontend surface. Status: pending. Commit: `feat(frontend): add role-aware authentication shell`.
- **T5** (S14, S21) — Document the permission matrix and known plain-HTTP LAN limitation. Route: inline. Status: pending. Commit: `docs(auth): document roles and LAN security boundary`.
- **T6** (S1-S26) — Run full backend/frontend/browser verification, independent verification, native RDD assessment/review, and prepare delivery evidence. Route: inline. Status: pending. Commit: evidence in `odd/tasks/auth-roles.md`.

## Log

- **L1** (2026-10-29) — User: "Avancemos el #4".
- **L2** (2026-10-29) — Repository state before implementation: `dev` clean and synchronized at `dd3d59e`; no open PRs; issue #4 open with 10 closed decisions; Phase 0 complete. Branch `issue/4-auth-roles` created from `dev`.
- **L3** (2026-10-29) — Task size is large: backend identity/session/authorization, a separate SPA shell, migrations, contract tests, docs, and browser verification cannot be resumed from the original request plus a small diff alone. Tracking created before the first source write. Delivery forecast is roughly 700–900 authored changed lines, above the 400-line review-workload threshold; delivery strategy remains `ask-on-risk` until the owner decides before any oversized PR is created.
- **L4** (2026-10-29) — Writer routing: T1-T3 and T5 stay inline because they are one backend behavior and the documentation contract depends on it. T4 is a separate frontend behavior (several files and roughly 100+ changed lines) with a disjoint edit surface, so it is delegated. T6 remains inline with the parent.
- **L5** (2026-10-29) — Design gate: `gentle_design list` found no existing design and three current CSS sources but no `design/system.md`. The production implementation will derive a small local token set from the current frontend CSS source rather than inventing a separate visual direction; no separate design-artboard feature is authorized or needed for this backend-centered issue.
- **L6** (2026-10-29) — User: "Cuando crees el feature document te detienes para yo revisarlo". Implementation is paused at the feature-document review gate; no source code has been written.
- **L7** (2026-10-29) — User corrections: "En la S22 agrega el campo de telefono, en la S23 tambien necesito que adicional a quién los hizo tambien se registre cuando se hizo, explicame la S5." S22 now includes a staff phone field (requiredness was not specified). S23 now requires both actor and creation date/time for business records. No source implementation was started.
- **L8** (2026-10-29) — User: "Entiendo, haz commit de realizado hasta ahora y continuamos en la proxima sesion." The feature document review gate is complete for the current corrections. The owner explicitly stopped implementation for this session; only the ODD feature document is committed, with no source implementation. Next session resumes at T1.
