# Contributing to SkillGraph

Thank you for contributing to SkillGraph! This guide will help you get started.

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratikbawkar/Skillgraph-ai.git
   cd Skillgraph-ai
   ```

2. **Set up backend**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install --no-build-isolation -r requirements-dev.txt
   ```

3. **Set up frontend**
   ```bash
   cd frontend
   npm install
   ```

## Running Tests Locally

### Backend Tests
```bash
cd backend
pytest                          # Run all tests
pytest -v                       # Verbose output
pytest --cov=app                # With coverage
pytest tests/integration/       # Integration tests only
pytest tests/unit/              # Unit tests only
```

### Frontend Tests
```bash
cd frontend
npm run test                    # Watch mode
npm run test -- --run          # Single run
npm run test:coverage          # With coverage
```

## Code Quality

### Linting

**Backend:**
```bash
cd backend
ruff check app tests           # Check for style issues
ruff format app tests          # Auto-format code
```

**Frontend:**
```bash
cd frontend
npm run lint                   # ESLint
npm run type-check             # TypeScript type checking
```

### Type Checking

**Backend:**
```bash
cd backend
mypy app --ignore-missing-imports
```

**Frontend:**
```bash
cd frontend
npx tsc --noEmit
```

## Branch Strategy

- **main**: Production-ready code (from Phase 2+)
- **develop**: Integration branch for Phase 1
- **feature/***: Feature branches (branch off `develop`)

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Commit Messages

Use clear, descriptive commit messages:
```
type(scope): brief description

Longer explanation if needed.

- Bullet point 1
- Bullet point 2
```

**Types**: feat, fix, refactor, test, docs, chore, ci

**Example:**
```
feat(skills): add git skill to python-developer role

- Add pd-git skill with beginner difficulty
- Update skill graph with version control basics
- Add learning resource reference
```

## Pull Request Process

1. **Push your feature branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Target: `develop` branch
   - Use the PR template (auto-populated)
   - Fill out all sections
   - Link related issues

3. **CI/CD Pipeline**
   The following checks will run automatically:
   - ✅ Backend tests (Python 3.11, 3.12)
   - ✅ Frontend tests
   - ✅ Linting and type checks
   - ✅ Security audits (bandit, pip-audit, npm audit)
   - ✅ Coverage uploads to Codecov

4. **Code Review**
   - Wait for maintainer review
   - Address feedback
   - Keep commits clean and logical

5. **Merge**
   - All CI checks must pass
   - Code review must be approved
   - No merge conflicts
   - Merge to `develop` when ready

## Testing Guidelines

### Backend Testing
- Write unit tests for business logic
- Write integration tests for API endpoints
- Test both success and failure paths
- Aim for >80% code coverage

### Frontend Testing
- Test component rendering
- Test user interactions
- Test form validation
- Use React Testing Library best practices
- Mock external API calls

## Documentation

- Keep README.md up to date
- Add JSDoc comments for functions
- Update docs/ folder for architecture changes
- Document any new environment variables

## Common Issues

### Backend Dependency Issues
If you get pydantic-core build errors:
```bash
pip install --no-build-isolation --only-binary :all: pydantic-core
pip install -r requirements-dev.txt
```

### Frontend Module Not Found
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

- Check existing issues and PRs
- Ask in comments
- Review architecture docs in docs/architecture/

## Code of Conduct

- Be respectful
- Provide constructive feedback
- Help others when possible

---

Thank you for contributing to SkillGraph! 🚀
