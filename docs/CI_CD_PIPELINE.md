# CI/CD Pipeline Documentation

## Overview

The SkillGraph CI/CD pipeline automates quality checks and deployment workflows per plan.md Phase 1. All changes must pass CI before being merged to `develop`; successful merges trigger CD deployment verification.

## Workflow Structure

### 1. CI Workflow (`.github/workflows/ci.yml`)

Triggered on:
- Pull requests to `develop` branch
- Pushes to `develop` branch

**Backend Testing** (Python 3.11, 3.12 matrix):
```bash
✅ Ruff linting (style checks)
✅ Type checking (mypy)
✅ Security audit (bandit)
✅ Dependency audit (pip-audit)
✅ Unit + integration tests (pytest)
✅ Coverage upload to Codecov
```

**Frontend Testing**:
```bash
✅ ESLint linting
✅ TypeScript type checking (tsc)
✅ Unit tests (vitest)
✅ Coverage upload to Codecov
✅ Dependency audit (npm audit)
```

**Quality Gate**:
- All jobs must pass for the build to succeed
- Coverage reports sent to Codecov for tracking

### 2. CD Workflow (`.github/workflows/cd.yml`)

Triggered on:
- Successful pushes to `develop` branch

**Deployment Verification**:
```bash
✅ Backend health check (integration tests)
✅ Frontend production build verification
✅ Log deployment info (commit SHA, branch)
✅ Ready for Phase 2 AWS deployment
```

## Branch Strategy

- **main**: Production-ready (Phase 2+, AWS deployed)
- **develop**: Integration branch for Phase 1 (Vercel validation)
- **feature/***: Feature branches (PR to develop)

## Pull Request Workflow

1. Create feature branch off `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. Make changes and commit
   ```bash
   git add .
   git commit -m "type(scope): description"
   ```

3. Push to remote
   ```bash
   git push origin feature/my-feature
   ```

4. Open PR to `develop`
   - Use the PR template (auto-populated)
   - Complete all checklist items
   - Link related issues

5. CI runs automatically
   - View results in "Checks" tab
   - Address any failures

6. Code review and approval
   - Wait for maintainer review
   - Respond to feedback

7. Merge to develop
   - All checks must pass
   - No conflicts
   - Click "Squash and merge" or "Create a merge commit"

8. CD runs automatically
   - Verification gates run
   - Deployment logs appear in Actions

## Testing Requirements

### Before Committing

**Backend**:
```bash
cd backend
pytest                          # All tests pass
ruff check app tests            # No lint errors
mypy app --ignore-missing-imports  # No type errors
```

**Frontend**:
```bash
cd frontend
npm run test -- --run           # All tests pass
npm run lint                    # No lint errors
npm run type-check              # No type errors
npm audit                       # Review audit results
```

### Coverage Thresholds

- **Backend**: Target >80% coverage (code + tests)
- **Frontend**: Target >70% coverage (code + tests)
- **Codecov**: Multi-flag tracking (backend/frontend)

## Common Issues

### CI Fails: Ruff Lint Errors
```bash
cd backend
ruff check app tests     # See errors
ruff format app tests    # Auto-fix many issues
git add . && git commit -m "fix: lint issues"
git push
```

### CI Fails: Tests Failing
```bash
# Run locally to debug
cd backend
pytest -v tests/path/to/test.py

# Or frontend
cd frontend
npm run test -- tests/path/to/test.tsx
```

### CI Fails: Type Errors
```bash
cd frontend
npx tsc --noEmit        # See errors, fix in code
```

### CD Fails: Build Verification
```bash
# Test build locally
cd frontend
npm run build           # Should succeed without errors
npm run lint            # No lint errors
```

## Codecov Integration

Coverage reports are automatically uploaded after CI passes:
- Backend: `backend/coverage.xml` (pytest coverage)
- Frontend: `frontend/coverage/coverage-final.json` (vitest coverage)

View coverage:
- [Codecov Project Dashboard](https://codecov.io) (when configured)
- PR comment with coverage changes
- Badge in README

## Dependabot Integration

Automated dependency updates via `.github/dependabot.yml`:
- Python: Weekly updates (pip dependencies)
- Node.js: Weekly updates (npm dependencies)
- GitHub Actions: Weekly updates (workflow actions)

Dependabot PRs will run CI automatically. Review and merge after checks pass.

## Skipping Workflows

**Not recommended**, but if needed:

To skip CI on a commit:
```bash
git commit -m "message [skip ci]"
```

To skip CD on a push (not recommended):
- Manual merge to `develop` with `[skip ci]` will skip CD

## Troubleshooting

### Workflow not triggering
- Check branch name matches `develop` exactly
- Check file was actually committed (not just staged)
- Check GitHub Actions are enabled in repository settings

### Coverage not uploading
- Ensure Codecov token is set in repository secrets (if required)
- Check `coverage.xml` or `coverage-final.json` paths match workflow

### Tests pass locally but fail in CI
- CI runs Python 3.11 and 3.12 — test with both if possible
- CI environment is fresh — check for missing dependencies
- Use `-vv` flag to see more test details

## Next Steps (Phase 2)

When ready for AWS deployment:
1. Create infrastructure branch from `develop`
2. Add Terraform code to `infrastructure/`
3. Create separate CD workflow for AWS deployment
4. Configure AWS credentials in GitHub Secrets
5. Update branch protection to require successful CD workflow

---

For more details, see:
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Development workflow
- [plan.md](../plan.md) — Phase definitions and requirements
- [GitHub Actions Docs](https://docs.github.com/en/actions)
