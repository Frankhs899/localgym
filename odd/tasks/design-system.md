# Feature: design-system — LocalGym issue #27

Feature document for issue #27 (LocalGym). Route: design first, then production tokens and components. Risk: item 3 — the tokens and base components are consumed by every later screen.

## Specs

- **S1** — Restart from scratch, authorized by the owner: "Estás alucinando ya que playwright-cli está instalado, iniciemos de 0 la #27". Nothing from the discarded branch `issue/27-design-system` is recovered or reused.
- **S2** — Route chosen by the owner: "Artboards primero (fuente visual nueva)". Three clearly different visual directions for the App Shell and the socios listing are drawn as artboards under `design/design-system/`; the owner picks one; only then do tokens reach production code, and DESIGN.md is written from that direction.
- **S3** — There is no previous visual source. Issue #27 names `docs/design/stitch.html` as its input, but that file is absent from the working tree and `git log --all -- docs/design/` returns nothing: it was never committed on any branch. `design/` is empty and `docs/` contains only installation.md, product-brief.md and roles-permisos.md.
- **S4** — Issue #27 acceptance criteria, verbatim:
  - "**Tokens de diseño**: Paleta de color (primarios, neutros, estados de socios, semántica de alertas y acciones). Tipografía (escalas, pesos y jerarquía). Espaciado, elevaciones y bordes."
  - "**Estructura de Componentes Base**: **App Shell**: Estructura de layout (sidebar de navegación, topbar de usuario/sesión, área principal). **Listados / Búsqueda**: Barra de filtros, buscador reactivo, tabla/grilla de registros, chips/badges de estado. **Formularios**: Controles de entrada (text, select, radio), estados de error/validación, botones primarios y secundarios."
  - "**Documento Maestro**: Crear \docs/design/DESIGN.md como referencia técnica y visual para frontend."
  - "**Presupuesto de Entrega**: Si la entrega excede las 400 líneas de autor, estructurar en PRs encadenados (chained PRs) para mantener foco y revisión acotada (≤60 min)."
- **S5** — The artboards show the real domain of issue #5, never invented data. Fields: nombre, apellidos, tipo y número de documento (CC o CE), teléfono, email, fecha de nacimiento, contacto de emergencia (nombres, apellidos, teléfono, parentesco), foto opcional y estado. Rules that shape the interface, verbatim from #5:
  - "Estados: **activo / inactivo**. Sin moras en esta versión."
  - "El **número de documento solo lo edita un admin**, validado en el backend (no alcanza con ocultar el botón)."
  - "`recepcion` **sí** puede dar de baja. `profesor` tiene acceso **solo lectura**."
  - "Teléfono: **obligatorio y NO único**. ... Si ya existe otro socio con ese teléfono, se **avisa sin bloquear** (puede ser un familiar)."
  - "Búsqueda: parcial, por nombre/apellidos o documento, **insensible a acentos y mayúsculas** ... **15 resultados por página**, y **query vacía devuelve cero resultados** (no todo)."
  - "Email: **opcional**".
  - "el alta solo admite **mayores de 18 años**".
  - "**Responsive**: alta, listado y detalle utilizables en PC, tablet y teléfono (verificación manual documentada; el listado no se rompe en móvil)."
- **S6** — No membership columns. Issue #6 has no model, inventory or vocabulary yet, so the listing must not invent plan, vencimiento or cuota columns or a membership badge: #5 states that the badge "sin membresía vigente" "es un estado **derivado** y llega con #6".
- **S7** — Unresolved: #5 lists "Modo oscuro" under "Fuera de alcance de esta issue", while the discarded session had chosen a dark-only theme. T1 must therefore offer both strategies as different directions and T2 records the owner's choice.

## Tasks

- **T1** — Three visual directions (artboards) of App Shell + socios listing in `design/design-system/`. Route: writer. Commit: `86898c2`.
- **T2** — Owner picks one direction; record it in `design.json` and this Log. Chosen: `design/design-system/01-command-dark.html` (Command bar, dark single theme). Route: parent. Commit: pending.
- **T3** — Tokens to the `@theme` of `frontend/src/index.css`. Route: writer. Commit: pending.
- **T4** — Base components (App Shell, listing/table, status chips, form controls) in `frontend/src`. Route: writer. Commit: pending.
- **T5** — `docs/design/DESIGN.md`. Route: writer. Commit: pending.
- **T6** — Delivery stays within the review budget (chained PRs when a slice exceeds 400 authored lines, per S4). Route: parent. Commit: pending.
- **T7** — Implement the chosen artboard in the real stack: design tokens in the `@theme`, App Shell, Login, Perfil and the socios listing. Route: writer. Status: in progress (canvas handoff opened 2026-11-16). Blocker: the backend exposes only the accounts API, so a data-backed listing waits on issue #5. Commit: pending.

## Log

- **L1** (owner, 2026-11-16) — "Estás alucinando ya que playwright-cli está instalado, iniciemos de 0 la #27"
- **L2** (owner, 2026-11-16) — Route chosen: "Artboards primero (fuente visual nueva)".
- **L3** (evidence, 2026-11-16) — Verified on `dev` @ `2c50bbc`: `frontend/src/index.css` is one line, `@import "tailwindcss";`; no occurrence of `accent`, `theme` or `dark` anywhere in `frontend/src`; branch `issue/27-design-system` no longer exists; `docs/design/` was never committed.
- **L4** (evidence, 2026-11-16) — `playwright-cli` v0.1.22 is installed globally and its skill lives in `.agents/skills/playwright-cli/`; only the npm package `playwright` is absent. Browser verification of artboards is available.
- **L5** (T1, 2026-11-16) — Three directions written to `design/design-system/` (01-command-dark, 02-ledger-light, 03-split-workspace); no direction chosen yet.
- **L6** (owner, 2026-11-16) — Picked direction 01, "Command bar, dark single theme", from the canvas at three options. This settles S7: the product has one dark theme and no theme toggle, so issue #5's "Modo oscuro" out-of-scope line is read as "no toggle", not "no dark palette". The tradeoff the owner accepted: maximum at-a-glance density and rest for low-light reception, at the cost of contrast discipline and printing.
- **L7** (owner, 2026-11-16) — "Vamos a iterar sobre 01-command-dark, así que elimina las otras dos direcciones". Directions 02-ledger-light and 03-split-workspace were deleted from the working tree; both remain reachable in commit `86898c2`. From here the design work iterates on 01-command-dark only.
- **L8** (owner, 2026-11-16) — Comment 1r869kpb: integrate Google Fonts DM Serif Display (brand and headings), Inter (UI) and JetBrains Mono (numbers and meta) across the whole artboard, to judge the result before deciding whether the families get downloaded into the project. The artboard is now the only file in the design that references an external URL; the self-hosted decision is deferred to the owner.
- **L9** (owner, 2026-11-16) — "cambiemosla por Playfair Display a ver como queda": DM Serif Display was swapped for Playfair Display (full 400-900 range), and the brand (700), page title (700) and state heading (600) got their weights back. Sizes unchanged.
- **L10** (owner, 2026-11-16) — Comment ojft48gd: the separate Nombre and Apellidos columns became a single SOCIO column holding the full name. The table now has 7 columns; email keeps its own column.
- **L11** (owner, 2026-11-16) — Comment azch800s: the EMAIL column was removed because the field is optional (#5 R10), and the address now renders as a muted second line under the name, absent when the socio has none. The table is 6 columns.
- **L12** (owner, 2026-11-16) — Canvas comments t28x89z5, 7und3cgg and yic156ef applied to the artboard: the desktop search field shrank to a 36 px height with a capped width, the estado dropdown became a three-segment control (Todos / Activos / Inactivos), and the F. NACIMIENTO column left the table, which is now 5 columns. No image was attached to comment 7und3cgg, so the segmented reading is an inference to confirm.
- **L13** (handoff, 2026-11-16) — The canvas handoff for `design-system/01-command-dark.html` opened T7: implement the artboard in the project's real stack. Evidence that bounds the scope: `backend/config/urls.py` only includes `apps.accounts.urls` (auth, session, `/api/me/`), there is no socios app, endpoint or serializer, and issue #5 is still open; `frontend/src/index.css` is one line (`@import "tailwindcss";`) and no component consumes a design token yet. The three artboard comments t28x89z5, 7und3cgg and yic156ef were applied to the artboard as the spec the implementation must follow.
