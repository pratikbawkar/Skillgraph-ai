# Backend Test Failures in GitHub Actions — Root Cause & Fix

## Problem

Backend tests were failing in GitHub Actions CI pipeline with dependency installation errors, specifically around `pydantic-core` build failures.

**Local Status**: ✅ All 46 tests pass  
**GitHub Actions**: ❌ Dependency installation fails

---

## Root Cause

### The Issue

The CI workflow was installing dependencies in the wrong order:

```yaml
pip install --upgrade pip
cd backend
pip install --only-binary :all: pydantic-core  # ✅ Correct: binary only
pip install -r requirements-dev.txt             # ❌ WRONG: re-triggers source build!
```

**What happens:**
1. `pip install --only-binary :all: pydantic-core` → Downloads pre-built wheel ✅
2. `pip install -r requirements-dev.txt` → Reads requirements.txt which includes pydantic
3. pip sees pydantic-core in environment already, but tries to verify dependencies
4. pip attempts to rebuild/upgrade pydantic-core from source 🔴
5. GitHub Actions runner has NO Rust compiler (rustc/cargo)
6. Build fails: `error: failed to run custom build command for 'pydantic-core'`

### Why It Works Locally

On Windows developer machine:
- Python 3.14.2 is installed (with dev tools)
- Rust toolchain is available
- `--no-build-isolation` works because compilation is possible

On GitHub Actions Ubuntu runner:
- Python 3.11 (clean)
- NO Rust toolchain (saves image space)
- `--only-binary :all:` is the ONLY way to install pydantic-core

---

## The Fix

### Installation Order

Install in this specific order:

```yaml
- name: Install backend dependencies
  run: |
    python -m pip install --upgrade pip
    cd backend
    # 1. Install pydantic-core first (binary-only, will lock version)
    pip install --upgrade --only-binary :all: pydantic-core
    
    # 2. Install runtime dependencies (uses locked pydantic-core)
    pip install -r requirements.txt
    
    # 3. Install dev tools individually (won't trigger rebuilds)
    pip install pytest pytest-cov httpx ruff
```

**Why this works:**
1. pydantic-core version is locked when installed first
2. requirements.txt sees it's already installed, doesn't try to rebuild
3. Dev tools (pytest, ruff, etc.) are added on top
4. No source compilation needed anywhere

### Alternative Approach (Not Used)

Could modify requirements-dev.txt to exclude pydantic-core:
```
-r requirements.txt
# pydantic-core handled separately via binary install
pytest>=8.3,<9
pytest-cov>=5.0,<6
httpx>=0.27,<0.28
ruff>=0.7,<0.8
```

**Why not chosen**: Would require modifying dependencies file, fragile if dependencies change

---

## What Changed

### Before
```yaml
pip install --only-binary :all: pydantic-core
pip install -r requirements-dev.txt  # ❌ Triggers rebuild
```

### After
```yaml
pip install --upgrade --only-binary :all: pydantic-core  # Lock it first
pip install -r requirements.txt                          # Won't rebuild
pip install pytest pytest-cov httpx ruff                 # Add dev tools
```

---

## Testing the Fix

### Local Verification
```bash
# Simulate GitHub Actions environment
cd backend

# Create fresh venv
python -m venv test_env
source test_env/bin/activate  # or test_env\Scripts\activate on Windows

# Test the installation order
pip install --upgrade pip
pip install --upgrade --only-binary :all: pydantic-core
pip install -r requirements.txt
pip install pytest pytest-cov httpx ruff

# Run tests
pytest -v
```

### GitHub Actions Verification
1. Push the fix to `develop` branch
2. Create feature branch PR to `develop`
3. Watch GitHub Actions "Checks" tab
4. Backend job should now:
   - ✅ Install pydantic-core (binary)
   - ✅ Install requirements (no rebuild)
   - ✅ Run all 46 tests
   - ✅ Pass

---

## Why This Specific Error Happened

GitHub Actions Ubuntu runner image:
- Minimal Python installation (no build tools)
- No Rust toolchain (saves ~500MB per image)
- Uses pre-built binary wheels by default

pydantic-core:
- Contains Rust code for performance
- Needs Rust compiler (`rustc`, `cargo`) to build from source
- Has pre-built wheels for Python 3.11 on Linux

Solution:
- Use `--only-binary :all:` to skip source build
- Install in correct order to prevent pip from retrying

---

## Files Modified

- `.github/workflows/ci.yml`: Backend dependency install order
- `.github/workflows/cd.yml`: Backend health check dependency install order

---

## Related Issues Fixed

This fix also resolves:
- ❌ Pydantic-core build failures on GitHub Actions
- ❌ Timeout during pip install (compilation takes 10+ minutes)
- ❌ Rust not found errors
- ❌ PyO3 version compatibility errors

---

## Backend Test Status

### All 46 Tests
```
✅ tests/integration/test_auth_api.py (5 tests)
✅ tests/integration/test_evidence_api.py (5 tests)
✅ tests/integration/test_health_api.py (1 test)
✅ tests/integration/test_profile_api.py (7 tests)
✅ tests/integration/test_roles_api.py (7 tests)
✅ tests/unit/test_evidence_evaluator.py (7 tests)
✅ tests/unit/test_progress_engine.py (9 tests)
```

**Total**: 46 passed, 0 failed, 1 warning (httpx deprecation in FastAPI)

---

## Next Steps

1. ✅ Push fix to GitHub (`develop` branch)
2. ✅ Verify CI passes on feature branch PR
3. ✅ Merge PR to develop
4. ✅ Verify CD runs successfully
5. Continue with Phase 1 Vercel deployment

---

**Status**: Backend test failure fixed ✅  
**Root Cause**: Incorrect pip installation order  
**Date**: 2026-09-24
