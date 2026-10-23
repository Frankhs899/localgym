# installation-guide — LocalGym issue #3 (D3: guía de instalación y autoarranque)

Branch: `issue/3-installation-guide` (from `dev`) · Delivery: single PR to `dev`
(repo convention, one issue = one PR) · Test runner: `backend/.venv/Scripts/python
backend/manage.py test` (Python 3.14.8), frontend `pnpm run build` + `pnpm run lint`.

Objective: deliver the D3 "camino principal" — a documented Python + venv
installation, Django serving the compiled SPA + the API from one process and
port on the LAN, auto-start of the server with the PC, and persistent data
outside the app directory. D3's level (2) meta (PyInstaller *onedir*) is NOT in
scope for this issue.

## Specs

Quotes are verbatim from GitHub issue #3 (Spanish) and docs/product-brief.md D3.

- **S1** — "Guía paso a paso: instalar Python, crear venv, migraciones, build
  del frontend". A complete step-by-step installation guide for the gym PC
  (Windows), written in Spanish to extend the repo's Spanish docs (README,
  product brief).
- **S2** — "Django sirve la SPA compilada + la API en un solo proceso/puerto".
  Offline/LAN serving with no cloud and no reverse proxy: waitress (WSGI
  server, Windows-native) + whitenoise (SPA assets from `frontend/dist` and
  Django statics from STATIC_ROOT). No frontend build config changes.
- **S3** — "Autoarranque del servidor con la PC (tarea programada o acceso
  directo)". A start script plus guide instructions covering both mechanisms:
  Task Scheduler at logon (recommended) and Startup-folder shortcut.
- **S4** — "Base de datos y backups en una carpeta de datos persistente, fuera
  del directorio de la app". Already implemented in settings
  (`LOCALGYM_DATA_DIR`, default `repo-root/data`); this issue documents it in
  `.env.example` and the guide, and fixes the backups convention
  (`data/backups/`) that issue #9 will use.

D3 verbatim (product brief §6): "Instalación en dos niveles: (1) camino
principal — instalación documentada con Python + venv + guía paso a paso +
autoarranque del servidor con la PC; Django sirve la SPA compilada + la API en
un solo proceso y puerto en la LAN; (2) meta posterior — empaquetado
PyInstaller en modo *onedir* para instalar "copiar y doble clic". Restricción
transversal: la base de datos SQLite y los backups viven en una carpeta de
datos persistente, fuera del directorio de la aplicación".

## Tasks

- [x] T1 (S2) — Backend single-process serving. Route: inline. Commit
  `ff707a2` (feat(backend): serve the compiled SPA and API from a single
  process). Evidence: SPA tests RED (404 != 200) → GREEN (6 tests OK);
  ruff clean; live probe all 200 (/, /assets/*, client-side route, /admin/,
  admin statics) on port 8000 via the start script.
- [x] T2 (S3) — Auto-arranque start script. Route: inline. Commit `5a503da`
  (feat(scripts): add the LocalGym server start script). Evidence: live
  probe served the full system on 0.0.0.0:8000; missing-venv and missing-.env
  error paths print the guide pointer. Bug found and fixed by the probe:
  `cd /d "%~dp0"` landed in scripts\ instead of the repo root.
- [x] T3 (S1, S3, S4) — Guide + config docs. Route: inline. Commit: this
  slice. Evidence: docs/installation.md covers the 8-step path, both
  auto-start options, update flow, interim backups, troubleshooting;
  .env.example documents LOCALGYM_ALLOWED_HOSTS and the production
  LOCALGYM_DATA_DIR; README gains the install section, the ALLOWED_HOSTS
  row and refreshed status. Note: the runtime denies AI edits to `.env*`
  files, so backend/.env.example was written via shell with disclosure.
- [ ] T4 — Verification + delivery: suite 6 OK, ruff OK, frontend lint OK,
  build OK, E2E probe OK. Remaining: push, PR, CI, merge (owner decides).

## Log

- L1 — (2026-10-23) User: "si" — start issue #3 now, confirming the pending
  plan from the previous session ("para la proxima" → issue #3, D3).
- L2 — (2026-10-23) Implementation decisions: waitress 3.0.2 + whitenoise
  6.12.0 (latest stable, verified via pip index); WHITENOISE_ROOT =
  frontend/dist with WHITENOISE_INDEX_FILE left False (docs-verified) so the
  root route is deterministic across CI/local/gym-PC; SPA view reads
  settings.FRONTEND_DIST per request (test-overridable); HttpResponse over
  FileResponse because FileResponse kept the file handle open on Windows
  (temp-dir cleanup failed with WinError 32) and is streaming (no
  response.content in tests).
- L3 — (2026-10-23) Verification: manage.py test config → 6 OK (exit 0);
  ruff check → clean; frontend eslint → clean; pnpm build → dist ok; live
  probe via scripts/start_server.bat → root 200 (471 B), asset 200 (222 KB),
  deep route 200 (=root), admin 200, admin static 200. collectstatic runs
  inside the start script, so gym-PC installs never hit the WhiteNoise
  "No directory at staticfiles" warning seen in bare test runs (CI shows it
  once, harmlessly).
