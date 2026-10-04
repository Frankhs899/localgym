# Feature: Monorepo Structure — LocalGym (issue #1)

Fase 0 implementation: scaffold the backend (Django 5.2 + DRF, venv, SQLite) and
frontend (React JS + Vite + Tailwind, pnpm, ESLint), and document the repo
structure and branch strategy in the README.

GitHub issue: https://github.com/Frankhs899/localgym/issues/1

## Goal

A functional monorepo skeleton matching the six acceptance criteria of issue #1.

## Status

Complete — all six acceptance criteria of issue #1 verified.

## Tasks

- [x] 1. Scaffold backend: Django 5.2 + DRF project (venv documented, SQLite at
      DATA_DIR outside the app dir, es-CO locale), requirements.txt pinned
- [x] 2. Scaffold frontend: React (JavaScript) + Vite + Tailwind v4 app with pnpm,
      packageManager pinned, ESLint configured (no JSDoc)
      — HANDED OFF (2026-10-03): the owner installs React + Vite manually with
      pnpm; the scaffolded frontend/ directory was deleted at the owner's request.
- [x] 3. README: document repo folder structure + branch strategy (main/dev/issue
      branches); .gitignore: add data/
- [x] 4. Verify all six acceptance criteria (manage.py check + migrate, vite
      build, eslint, README readback)

## Evidence

Commits are recorded here as tasks close (branch issue/1-monorepo-structure).

- Task 1: commit `04f1c17` — Django 5.2.17 + DRF 3.18.1 pinned in
  backend/requirements.txt; venv at backend/.venv; `manage.py check` clean and
  `manage.py migrate` applied into `data/db.sqlite3` (DATA_DIR outside the app
  directory, honoring D3); es-CO locale, America/Bogota timezone.
- Task 2: commit `d58d5e9` — owner installed React 19 + Vite 8 + ESLint 10
  (flat config) manually with pnpm after the handoff; parent added Tailwind 4.3.3
  via @tailwindcss/vite (plugin wired in vite.config.js, `@import "tailwindcss"`
  in src/index.css) and pinned `"packageManager": "pnpm@10.33.2"`. Evidence:
  `pnpm run build` OK (CSS 4.10 kB -> 10.16 kB with Tailwind preflight),
  `pnpm run lint` clean. No TypeScript, no JSDoc.
- Task 3: commit `bed77c7` — README documents the monorepo structure, the branch
  strategy (main stable via PR-only when the owner asks, dev integration,
  issue/N-slug from dev) and the dev setup commands; .gitignore covers data/.
- Task 4: all six acceptance criteria verified with inline evidence (worker
  subagent stalled twice on its model pool — timeouts — so implementation and
  verification ran inline as the reported fallback):
  1) folder structure documented: README §Estructura del monorepo;
  2) branch strategy documented: README §Estrategia de ramas;
  3) backend functional with DRF: check + migrate clean;
  4) frontend functional: build + lint clean, packageManager pinned;
  5) ESLint flat config in frontend/eslint.config.js, lint script green;
  6) SQLite configured at data/db.sqlite3 via DATA_DIR/LOCALGYM_DATA_DIR.
- Remaining outside this feature: pushing the branch, PR/merge to dev (owner
  decision), required status checks on main (issue #2, once CI exists).

## Notes

- Branch: issue/1-monorepo-structure created from dev (Git Flow-lite: ramas por
  issue desde dev; merges a main solo vía PR y cuando el dueño lo pida).
- Toolchain local: Python 3.14.8, Node 24.21.0, pnpm 10.33.2.
- Backend layout: backend/ (app root: manage.py + config/ project package); the
  Fase 1 apps will live in backend/apps/ (decided in their own issues).
- DATA_DIR: LOCALGYM_DATA_DIR env var, default repo-root/data (outside the app
  directory, persistent, gitignored) — cross-cutting constraint from D3.
- Tailwind v4 via @tailwindcss/vite plugin (no tailwind.config.js needed).
- Language: README in Spanish (repo convention); code and commits in English.
- ESLint in frontend without JSDoc (explicitly excluded by the owner).
- 2026-10-03 handoff: owner installs the frontend manually with pnpm. My scaffold
  (pnpm create vite --template react) was deleted at their request. Discovered: the
  current Vite react template ships oxlint (Rust linter), NOT ESLint — the D2
  criterion explicitly requires ESLint, so the manual install must include it.
