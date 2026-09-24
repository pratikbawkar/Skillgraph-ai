"""Phase 1 MOCK authentication endpoints.

POST /auth/register and POST /auth/login do NOT talk to Amazon Cognito.
They issue a signed opaque mock token (app/core/security.py) purely to
demonstrate the auth flow locally, per plan.md's phase-separation rule.
Phase 2 replaces the token issuance here with real Cognito.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.core.security import create_mock_token, hash_password, verify_password
from app.models.user import UserRecord
from app.repositories.user_repository import user_repository
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.schemas.user import UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_profile(record: UserRecord) -> UserProfile:
    return UserProfile(
        id=record.id,
        email=record.email,
        display_name=record.display_name,
        target_role_id=record.target_role_id,
        weekly_availability_hours=record.weekly_availability_hours,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest) -> AuthResponse:
    if user_repository.get_by_email(payload.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    salt, password_hash = hash_password(payload.password)
    record = user_repository.create(
        email=payload.email,
        display_name=payload.display_name,
        password_salt=salt,
        password_hash=password_hash,
    )
    token = create_mock_token(record.id, record.email)
    return AuthResponse(token=token, user=_to_profile(record))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    record = user_repository.get_by_email(payload.email)
    if record is None or not verify_password(
        payload.password, record.password_salt, record.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    token = create_mock_token(record.id, record.email)
    return AuthResponse(token=token, user=_to_profile(record))
