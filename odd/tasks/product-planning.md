# Feature: Product Planning — LocalGym

Planning feature for LocalGym: iterate the product idea into a brief, triage into
phases, set up the GitHub repository and Project, and open Phase 1 (MVP) issues.

## Goal

A reviewed product brief (`docs/product-brief.md`) plus a phased GitHub Project and
Phase 1 issues ready for implementation.

## Status

In progress — GitHub Project setup pending token scope grant.

## Tasks

- [x] 1. Draft product brief (vision, users/roles, MVP scope, phases, no-goals, open decisions)
- [x] 2. Iterate brief with the product owner; lock open decisions
- [x] 3. Create GitHub repo (remote) and first commit: brief, license, README
- [ ] 4. Set up GitHub Project with phases (project + milestones) — milestones Fase
  0/1/2 and labels done; the Project itself is blocked: token needs the `project`
  scope (user runs `gh auth refresh -s project,read:project`)
- [x] 5. Open Phase 1 (MVP) issues with acceptance criteria

## Evidence

Commits are recorded here as tasks close.

- Task 3: commit `432d8e0` on `main` — "chore: bootstrap repository (product brief,
  MIT license, README)"; remote: https://github.com/Frankhs899/localgym
- Task 5: issues #1-#3 (Fase 0) and #4-#9 (Fase 1 MVP) created with labels
  fase-0/fase-1 and milestones Fase 0 #1 / Fase 1 #2 / Fase 2 #3;
  https://github.com/Frankhs899/localgym/issues/1 through /issues/9

## Notes

- Product-owner decisions: staff with roles (owner + reception + teacher); MVP =
  members + memberships + payments (cash/transfer, manual registration); web app
  served by a local server inside the gym; offline-first (no internet dependency);
  Colombian focus (es-CO, COP); open source with a free license (TBD, MIT proposed);
  one instance per gym; app UI entirely in Spanish.
- gh CLI v2.102.0 authenticated as Frankhs899 (scopes: repo, workflow, read:org, gist).
- Language convention: brief iterated in Spanish with the product owner (product
  language is Spanish); code, commits, and harness docs default to English.
- Correction round 1 (product owner): removed check-in/asistencia, clases/turnos
  (Fase 3 removed) and portal de socios — never decided by the owner; socios are
  NOT users (staff-only login); Fase 2 reportes wording clarified; open decisions
  D1-D4 being iterated with the owner.
- Decision round: D1 closed (MIT license), D4 closed (offline daily expiration
  list). D2 closed (stack): Django 5.2 + DRF, SQLite, React (JavaScript, no TS —
  maintainer's choice) + Tailwind + Vite, pnpm (pinned via packageManager),
  mandatory venv, ESLint in frontend (JSDoc explicitly excluded by owner).
  Auth approach decided: Django session (cookie) for the SPA. D3 recommendation
  pending confirmation: documented install (Python + venv + guide + autostart;
  Django serves compiled SPA + API, single process/port on LAN) as primary path;
  PyInstaller onedir packaging as a later goal; DB + backups in a persistent data
  folder outside the app directory (cross-cutting constraint).
- Decision round complete: D1 (MIT), D2 (stack), D3 (two-tier installation), D4
  (offline expiration list) all closed; SPA auth = Django session (cookie).
  Added requirement: responsive UI for all device types (product-owner request).
