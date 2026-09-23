from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.progress_repository import progress_repository
from app.repositories.role_repository import role_repository
from app.repositories.user_repository import user_repository


@pytest.fixture(autouse=True)
def _reset_repositories():
    """Ensure each test starts from clean, deterministic in-memory state."""
    user_repository.reset()
    progress_repository.reset()
    progress_repository.seed_demo_data(role_repository.list_role_models())
    yield


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
