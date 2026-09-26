# SkillGraph AI

Helps students and early-career learners identify skill gaps for a target role and turn those gaps into a practical, project-based learning roadmap with measurable evidence of progress.

See [`plan.md`](plan.md) for the full project operating contract (goals, architecture, phases, CI/CD, and rules every change must follow).

## Repository layout

```text
frontend/    Next.js + TypeScript UI
backend/     FastAPI backend (Phase 1: mocked auth/storage/AI, see backend/README.md)
infrastructure/terraform/  AWS infrastructure (Phase 2+)
e2e/         Playwright end-to-end tests
performance/ k6 performance tests
docs/        Architecture notes and ADRs
```

## Quick start (local development)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # defaults to mock data, USE_MOCKS=true
npm run dev
```

Runs at http://localhost:3000 (Next.js will pick another port automatically if 3000 is busy). The homepage includes a Phase-1 landing visual — an animated orbit/solar-system graphic (`frontend/app/page.tsx`) — purely cosmetic, no backend dependency.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows Git Bash; macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

See [`backend/README.md`](backend/README.md) for what's mocked in Phase 1 and how to run tests/lint.

## Branching

- `main` — production-ready / release branch.
- `develop` — active integration branch; feature branches target this.
- `feature/*` — work in progress.

Pull latest `develop` (or `main`) before starting local testing — a branch behind its integration target will be missing recently merged changes.

## Deployment

- **Phase 1 (current):** Vercel validation deployment from `develop`. See [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md).
- **Phase 2+:** AWS production (Terraform-managed serverless architecture). See `plan.md` section 5.

## Testing

```bash
# Frontend
cd frontend && npm run test && npm run type-check && npm run lint

# Backend
cd backend && pytest && ruff check .
```

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for PR rules and CI quality gates.
