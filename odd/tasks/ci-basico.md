# Feature: CI básico — LocalGym (issue #2)

Fase 0 implementation: GitHub Actions CI for backend and frontend, smoke
tests for the Django project, and required status checks protecting `main`.

GitHub issue: https://github.com/Frankhs899/localgym/issues/2

## Goal

A green CI pipeline on pushes and PRs to `dev`/`main`, with `main` protected
by the CI checks, per the five acceptance criteria of issue #2 and the seven
owner decisions recorded on 2026-10-12.

## Status

In progress.

## Specs

- S1 — Issue #2 criterion (verbatim): "Job del backend: instala venv, corre
  los tests de Django." Approved refinement (owner decision, 2026-10-12):
  the job uses `actions/setup-python` (Python pinned 3.14.8) + `pip
  install -r requirements.txt` on the ephemeral runner VM — the isolated
  environment the criterion's "venv" intent covers — plus a dummy
  `LOCALGYM_SECRET_KEY` (settings import fails without it, by design) and
  `python manage.py test`.
- S2 — Issue #2 criterion (verbatim): "Job del frontend: `pnpm install`,
  build y lint" — `pnpm install --frozen-lockfile`, `pnpm run build`,
  `pnpm run lint`; Node pinned 24.21.0; pnpm resolved from the
  `packageManager` field (10.33.2) via pnpm/action-setup with
  `package_json_file: frontend/package.json` (the action reads the repo
  root's package.json by default, which does not exist here).
- S3 — Issue #2 criterion (verbatim): "El workflow corre en push a `dev`, en
  PRs hacia `dev`, y en pushes y PRs hacia `main`."
- S4 — Issue #2 criterion (verbatim): "Grupo de `concurrency` configurado
  para evitar corridas duplicadas (mismo commit disparando push + PR)."
  Implementation: per-ref group `${{ github.workflow }}-${{ github.ref }}`
  with `cancel-in-progress: true`, so a superseded run of the same ref is
  cancelled instead of piling up.
- S5 — Issue #2 criterion (verbatim): "Protección de rama en `main`: cambios
  solo vía PR con los status checks del CI como requisito." Owner decision:
  the agent applies it with `gh api` (required status checks endpoint),
  keeping every existing protection untouched (PR-only, dismiss stale
  reviews, required conversation resolution, no force pushes, no
  deletions, `enforce_admins` off).
- S6 — Owner decision (verbatim, 2026-10-12): "Agrega los smoke tests para
  el backend" — 2-3 minimal tests; `manage.py test` with 0 tests exits 0
  and verifies nothing, so the CI job needs at least one real test.
- S7 — Owner decision (verbatim, 2026-10-12): "hay que pinear la versión de
  python y node" — Python 3.14.8 and Node v24.21.0 (the versions that
  already work locally); pnpm 10.33.2 from the `packageManager` field.
- S8 — Negative scope (owner decisions, 2026-10-12): no CD ("No veo
  necesario CD por ahora"); no coverage thresholds ("regla sana": real
  tests first, a floor only when a real suite exists); no Dependabot for
  now; no backend linter inside this issue — ruff was approved for its own
  issue after #2 ("Va con issue propia después de la #2").

## Tasks

- [x] 1. Backend smoke tests (S1, S6): observe `manage.py test` with 0
      tests (the trap the owner's decision names), then add
      `backend/config/tests.py` with 3 minimal tests (settings resolve,
      admin login responds, ORM persists) and get them green. Commit.
- [x] 2. CI workflow (S1-S4, S7): `.github/workflows/ci.yml` with `backend`
      and `frontend` jobs, triggers on push/PR to `dev`+`main`, per-ref
      `concurrency`, pinned tool versions; update the two README bullets
      that defer to this issue. Commit.
- [x] 3. Local verification: `manage.py test` (3 tests), `pnpm run build`,
      `pnpm run lint` — the exact commands the CI jobs run.
- [ ] 4. Push `issue/2-ci-basico`, open the PR to `dev`, watch the CI run
      go green on GitHub (push/PR authorized by the owner first).
- [ ] 5. Protect `main` (S5): required status checks with the exact
      check-run names reported by the green run (a mismatch leaves `main`
      stuck on "Expected — Waiting for status to be reported").
- [ ] 6. Independent verification + native review assess (risk item 5:
      CI/delivery).
- [ ] 7. Record evidence here, commit the doc, report. Merge and closing
      issue #2 stay owner decisions.

## Evidence

(recorded as tasks close)

- Task 1: RED — `.venv/Scripts/python manage.py test` prints "Ran 0 tests
  ... NO TESTS RAN" and exits 0, proving the trap. GREEN — after adding
  `backend/config/tests.py`: "Ran 3 tests in 0.281s ... OK", exit 0; the
  sqlite test database runs in-memory (`file:memorydb_default`), all
  migrations apply, and the three smoke tests pass (settings, admin login
  200, superuser persists). Local: Python 3.14.8.
- Task 2: commit `8ac28fa` — `.github/workflows/ci.yml` (78 lines: two
  jobs, triggers push/PR to dev+main, concurrency group
  `CI-<ref>` with cancel-in-progress, Python 3.14.8 + pip cache, Node
  24.21.0 + pnpm cache, `package_json_file: frontend/package.json` for
  pnpm/action-setup, dummy `LOCALGYM_SECRET_KEY` injected in the test
  step) plus README: branch strategy bullets now describe the real CI
  and required checks, Estado notes issue #2 in flight, and the dev
  setup block gains the `manage.py test` line.
- Task 3: local verification green with the exact CI commands —
  `.venv/Scripts/python manage.py test`: "Ran 3 tests ... OK", exit 0;
  `pnpm run build`: "✓ built in 601ms" (20 modules, dist emitted);
  `pnpm run lint`: clean, exit 0. Local: Node 24.21.0, pnpm 10.33.2,
  Python 3.14.8.

## Notes

- Branch: `issue/2-ci-basico` from `dev` (`1dae7d1`) — repo convention
  `issue/N-slug` (README, Git Flow-lite), mandated by the issue #2 body.
- CI needs a dummy `LOCALGYM_SECRET_KEY` because `config/settings.py:34`
  reads it with no default (fail-closed, the R1-001 fix). The dummy value
  lives in the workflow file on purpose: it is not a secret, it only signs
  sessions of ephemeral test runs.
- The settings import creates `DATA_DIR` (repo-root `data/`); on the runner
  that folder is ephemeral. The sqlite TEST database defaults to in-memory,
  so no state leaks between runs.
- Check-run names must match the job ids exactly ("backend", "frontend")
  for the required status checks; jobs get no display `name` field for that
  reason.
- GitHub Actions versions resolved 2026-10-12 from the GitHub API:
  actions/checkout@v7, actions/setup-python@v7, actions/setup-node@v7,
  pnpm/action-setup@v6.
- README §Estrategia de ramas: "El CI corre en pushes y PRs a `dev` y a
  `main` (se configura en la issue #2)" and "Los status checks requeridos
  en `main` se agregan cuando el CI exista" — both bullets are updated by
  task 2 so the README matches what now exists.

## Log

- L1 (verbatim): "Arranca" — authorizes implementing issue #2 with the
  seven decisions recorded on 2026-10-12 (quoted in S1-S8). Creating the
  ruff issue on GitHub was left unanswered by the owner and stays outside
  this feature until they say so.
