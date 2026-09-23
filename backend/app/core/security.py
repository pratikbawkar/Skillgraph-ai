"""
Phase 1 MOCK authentication only.

This module does NOT call Amazon Cognito. It issues a small HMAC-signed
opaque token purely so the API can demonstrate an authenticated flow
locally (register -> token -> authenticated profile access) without any
real AWS dependency, per plan.md's phase-separation rule ("do not
introduce Phase 2 AWS production infrastructure while Phase 1 validation
criteria are unmet").

Phase 2 TODO: replace `create_mock_token` / `decode_mock_token` with real
Cognito user-pool token issuance/verification. Callers depend on the
`require_current_user_id` / `optional_current_user_id` FastAPI
dependencies below, so the swap should not require changing route code.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import Header, HTTPException, status

from app.core.config import get_settings

_PBKDF2_ITERATIONS = 100_000


def hash_password(password: str, salt_hex: str | None = None) -> tuple[str, str]:
    """Hash a password with PBKDF2-HMAC-SHA256. Returns (salt_hex, hash_hex)."""
    salt_hex = salt_hex or secrets.token_hex(16)
    derived = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), _PBKDF2_ITERATIONS
    )
    return salt_hex, derived.hex()


def verify_password(password: str, salt_hex: str, expected_hash_hex: str) -> bool:
    _, derived_hex = hash_password(password, salt_hex)
    return hmac.compare_digest(derived_hex, expected_hash_hex)


def _sign(data: str, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), data.encode("utf-8"), hashlib.sha256).hexdigest()


def create_mock_token(user_id: str, email: str) -> str:
    settings = get_settings()
    payload = {"sub": user_id, "email": email, "iat": int(time.time())}
    payload_b64 = (
        base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
        .decode("ascii")
        .rstrip("=")
    )
    signature = _sign(payload_b64, settings.mock_auth_secret)
    return f"{payload_b64}.{signature}"


def decode_mock_token(token: str) -> dict | None:
    settings = get_settings()
    try:
        payload_b64, signature = token.split(".", 1)
    except ValueError:
        return None
    if not hmac.compare_digest(_sign(payload_b64, settings.mock_auth_secret), signature):
        return None
    padding = "=" * (-len(payload_b64) % 4)
    try:
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + padding))
    except (ValueError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict):
        return None
    return payload


def _extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]


def require_current_user_id(authorization: str | None = Header(default=None)) -> str:
    """FastAPI dependency: 401s when no valid mock token is presented.

    Used for endpoints that need a real caller identity (profile).
    """
    token = _extract_bearer_token(authorization)
    payload = decode_mock_token(token) if token else None
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token",
        )
    return payload["sub"]


def optional_current_user_id(authorization: str | None = Header(default=None)) -> str | None:
    """FastAPI dependency for Phase 1 endpoints that don't yet enforce auth
    (roles/progress, evidence).

    TODO(Phase 2): require real Cognito-backed auth on these routes once the
    frontend wires up a real, end-to-end login flow. Today they fall back to
    a seeded demo user (see app/repositories/progress_repository.py).
    """
    token = _extract_bearer_token(authorization)
    payload = decode_mock_token(token) if token else None
    return payload.get("sub") if payload else None
