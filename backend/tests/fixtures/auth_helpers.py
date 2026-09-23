"""Shared test helpers for exercising the Phase 1 mock auth flow."""

from __future__ import annotations

from fastapi.testclient import TestClient

DEFAULT_PASSWORD = "SuperSecret123"


def register_user(
    client: TestClient,
    email: str = "test@example.com",
    password: str = DEFAULT_PASSWORD,
    display_name: str = "Test User",
) -> dict:
    response = client.post(
        "/auth/register",
        json={"email": email, "password": password, "displayName": display_name},
    )
    assert response.status_code == 201, response.text
    return response.json()


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}
