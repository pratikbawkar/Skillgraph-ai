# SkillGraph AI — Backend (Phase 1)

FastAPI backend skeleton for SkillGraph AI. See the repository-root
`plan.md` for the full operating contract; this file only covers backend
setup and Phase 1 specifics.

## Phase 1 scope — what is mocked

Per `plan.md`'s phase-separation rule, **no live AWS calls happen anywhere
in this codebase by default**:

- **Auth is mocked**, not Amazon Cognito. `POST /auth/register` and
  `POST /auth/login` issue a small HMAC-signed opaque token
  (`app/core/security.py`). Phase 2 replaces this module's token
  issuing/verification with real Cognito.
- **Storage is in-memory**, not DynamoDB/S3. `app/repositories/*.py` hold
  process-local dictionaries shaped like the interface a Phase 2
  DynamoDB-backed repository will implement.
- **Evidence evaluation is a heuristic**, not Amazon Bedrock.
  `app/services/evidence_evaluator.py` does plain keyword-overlap between
  the submission and the target skill's name/description/category, gated
  behind `USE_BEDROCK_MOCK` (defaults to `true`). Setting it to `false`
  raises `NotImplementedError` — the Phase 2 Bedrock call is not
  implemented yet, and this is the only intended seam for adding it later.
- **Skill-progress scoring is deterministic**, never AI-generated
  (`app/services/progress_engine.py`): selfAssessment (20) + objectiveQuiz
  (30) + practicalProject (30) + evidenceSubmitted (20) = 100, with a
  missing component always contributing 0.

Because there is no full auth-middleware wiring yet, `GET
/roles/{roleId}/progress` and `POST /evidence` fall back to a seeded demo
user (`demo-user`) when no `Authorization: Bearer <token>` header is
supplied. This is called out with `TODO(Phase 2)` comments at each call
site in `app/api/roles.py` and `app/api/evidence.py`.

## Setup

```bash
cd backend
python -m venv .venv
# Windows (Git Bash):
source .venv/Scripts/activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements-dev.txt
cp .env.example .env   # optional — defaults work out of the box
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Test

```bash
pytest
```

Unit tests for the pure scoring engine live in `tests/unit/`; API-level
tests live in `tests/integration/`. Shared test helpers live in
`tests/fixtures/`.

## Lint

```bash
ruff check .
```

## Repository structure

```text
backend/
├── app/
│   ├── api/            # FastAPI routers (auth, profiles, roles, evidence, health)
│   ├── core/           # settings + mock auth
│   ├── models/         # internal domain records + skill-graph seed data
│   ├── schemas/        # Pydantic API schemas (camelCase, mirrors frontend/lib/types.ts)
│   ├── services/       # deterministic progress engine, evidence evaluator
│   ├── repositories/   # in-memory repositories (Phase 2: swap for DynamoDB)
│   └── main.py
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```
