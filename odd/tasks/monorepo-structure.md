# Feature: Monorepo Structure — LocalGym (issue #1)

Fase 0 implementation: scaffold the backend (Django 5.2 + DRF, venv, SQLite) and
frontend (React JS + Vite + Tailwind, pnpm, ESLint), and document the repo
structure and branch strategy in the README.

GitHub issue: https://github.com/Frankhs899/localgym/issues/1

## Goal

A functional monorepo skeleton matching the six acceptance criteria of issue #1.

## Status

Complete — all six acceptance criteria of issue #1 verified.

Native review (RDD) pending on this branch: lineage `review-a20d46b92a431fef`
is `escalated` after the targeted validator rejected the first R1-001
correction (commit `6dcffa4`); a replacement fix built on django-environ is
being prepared and must still be reviewed.

## Specs — R1-001 correction (native review)

- S1 — the corrected candidate must remove the harm the frozen finding names.
  Native validator verdict (verbatim): "the SECRET_KEY assignment at
  backend/config/settings.py:26-29 still commits a fixed, publicly known
  signing key as its fallback ... The hardcoded key R1-001 flagged remains in
  the file and is what any deployment that does not explicitly set
  LOCALGYM_SECRET_KEY will sign with." and "DEBUG still defaults to on ...".
  So: no publicly known SECRET_KEY fallback, and DEBUG off by default.
- S2 — owner decision (2026-10-11): "Fix con django-environ y seguir la
  review". Adopt django-environ now: `env('LOCALGYM_SECRET_KEY')` required and
  `DEBUG=(bool, False)`.
- S3 — two-tier install constraint (D3): a committed `.env.example` documents
  the variables; the real `.env` stays out of git.

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
- [x] 5. Correct R1-001 with django-environ: SECRET_KEY required from the
      environment, DEBUG default False, committed .env.example (+ .gitignore
      exception and README setup step). Evidence: commit `2ec7a77` —
      `manage.py check` exits 1 without LOCALGYM_SECRET_KEY ("Set the
      LOCALGYM_SECRET_KEY environment variable") and 0 with it; `migrate`
      exits 0; DEBUG resolves False by default and True with
      LOCALGYM_DEBUG=True; Django 5.2.17 + django-environ 0.14.0 pinned.
      Native review of this candidate: pending.

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
- Native review (RDD): pending — the owner will start it from scratch in a
  future session; no earlier review state carries over.

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

## Log

- L1 (verbatim): "Hola, qué está pendiente?"
- L2 (verbatim, answer to the managed-assets question): "Sí, corré el sync"
- L3 (verbatim, recorded through the decision prompt): "Commit y seguí hasta
  capturar la corrección"
- L4 (verbatim, recorded through the decision prompt): "Fix con django-environ
  y seguir la review"
- L5 (verbatim): "Algun problema?"
- Evidence 2026-10-11: commit `6dcffa4` (os.environ.get fix, 4 lines) REJECTED
  by the native targeted validator — closure `escalated`,
  `targeted_validator_rejected`, store_revision sha256:cfa65055…,
  `correction_attempts` 1, `cumulative_correction_lines` 4 of 200,
  `correction_regression` passed, `original_criteria` failed.
- L6 (verbatim, recorded through the decision prompt): "Creala por bash" —
  backend/.env.example is created through a shell heredoc because the harness
  safety policy blocks write access to that sensitive path (.env*).
- Evidence 2026-10-11: commit `2ec7a77` replaces the rejected correction.
  Independent verification was UNAVAILABLE: the gentle-ai-verify subagent
  timed out (stalled 4 min after a bash call) and was not retried, so the
  remaining checks ran inline and are not independent.

