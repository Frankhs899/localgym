# Feature: ruff-backend — LocalGym (issue #13)

Adopt ruff as the Django backend linter, as its own issue after #2 (basic CI),
so the lint PR is born with CI checks that validate it.

GitHub issue: https://github.com/Frankhs899/localgym/issues/13

Branch: `issue/13-ruff-backend` → PR to `dev`.

## Status

In progress. Done: T1, T2 (baseline lint measurement, Log L3). Pending:
T3-T5, T7, T6 commit (edit already in the working tree), then native RDD
review (T8). Push + PR = owner decision.

## Specs

Specs S1-S7 quote issue #13's acceptance criteria verbatim (issue authored in
Spanish; quotes kept as-is):

- **S1**: "`backend/requirements-dev.txt` con ruff pineado (0.17.0), separado de las dependencias de producción"
- **S2**: "`backend/pyproject.toml` con la config acordada: `target-version = \"py314\"`, `line-length = 100`, `select = [\"E\", \"F\", \"I\", \"DJ\", \"UP\"]`"
- **S3**: "Medición inicial con defaults documentada antes de escribir la config (hallazgos del propio repo, no una config de internet)"
- **S4**: "`ruff check` pasa limpio sobre el backend (hallazgos corregidos a mano o arreglados con `--fix`)"
- **S5**: "El job `backend` del CI corre `ruff check` como paso adicional"
- **S6**: "`docs/product-brief.md` actualiza D2 para incluir ruff en el backend"
- **S7**: "Fuera de alcance: `ruff format` (posterido) y pre-commit hooks (decisión futura)"

Constraints from the approved plan (owner decisions, 2026-10-12, Engram topic
`localgym-ruff-backend-plan`): `select = ["ALL"]` is forbidden (new rules
activate on version bumps and break CI without our own changes); mandatory
method — measure with defaults BEFORE writing the config; ruff must NOT go
into `requirements.txt` (production install, D3).

## Tasks

- T1 (S1): create `backend/requirements-dev.txt` with ruff==0.17.0 — DONE, commit c1
- T2 (S3): install ruff into `backend/.venv`, measure with defaults BEFORE any config, document findings — DONE, evidence in Log L3, commit c1
- T3 (S2): write `backend/pyproject.toml` with the agreed config — pending
- T4 (S4): fix remaining findings by hand until `ruff check` is clean — pending (expected trivial: the only target-set finding is resolved by line-length 100; re-verify with the config file in place)
- T5 (S5): additional `ruff check` step in the CI `backend` job (`.github/workflows/ci.yml`) — commit c2
- T6 (S6): update D2 in `docs/product-brief.md` — EDIT MADE (uncommitted), commit c3 pending
- T7: functional verification (manage.py test 3 OK, clean `ruff check`) + evidence in this doc — commit c4

## Log

- L1 (2026-10-21): Owner: "primero lo del working tree, haz el commit" → done (commit `027eb3c`, pushed to `dev`). Then, to "¿pusheo dev y arranco con la issue #13 (ruff para el backend, plan ya aprobado)?": "si". Authorized to start with the already-approved plan.
- L2 (2026-10-21): Owner stopped implementation before the first code write: this feature doc had been drafted in Spanish; rewritten in English per repo artifact convention (verbatim Spanish quotes from the issue kept as-is).
- L3 (2026-10-21): T1+T2 done. ruff 0.17.0 installed into `backend/.venv` via `pip install -r requirements-dev.txt`. Baseline measurement BEFORE writing any config (S3 evidence): (1) `ruff check backend/` with 0.17.0 defaults → clean, exit 0; (2) `ruff check --fix backend/` with defaults → no-op, nothing to fix; (3) target rule set previewed via CLI flags (no config file): `ruff check backend/ --select E,F,I,DJ,UP` → exactly 1 finding: E501 line-too-long at `backend/config/settings.py:109` (91 > 88; the Django template's `AUTH_PASSWORD_VALIDATORS` line); (4) same target set with `--line-length 100 --target-version py314` → clean. Conclusion: the owner-approved config resolves the only finding; no code fixes required.
- L4 (2026-10-21): Owner stopped the session: "paremos por hoy, continuamos la proxima sesión". T1+T2 unit committed. Next session: T3 → T4 (re-verify clean with the config file in place) → T5 (CI) → commit the pending D2 edit → T7 → T8 (RDD review); push + PR = owner decision.
