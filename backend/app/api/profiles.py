"""User profile endpoints. Requires the Phase 1 mock auth token (see
app/core/security.py) via `Authorization: Bearer <token>`.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import require_current_user_id
from app.models.user import UserRecord
from app.repositories.user_repository import user_repository
from app.schemas.user import ProfileUpdateRequest, UserProfile

router = APIRouter(prefix="/profile", tags=["profile"])


def _to_profile(record: UserRecord) -> UserProfile:
    return UserProfile(
        id=record.id,
        email=record.email,
        display_name=record.display_name,
        target_role_id=record.target_role_id,
        weekly_availability_hours=record.weekly_availability_hours,
    )


@router.get("", response_model=UserProfile)
def get_profile(user_id: str = Depends(require_current_user_id)) -> UserProfile:
    record = user_repository.get_by_id(user_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _to_profile(record)


@router.put("", response_model=UserProfile)
def update_profile(
    payload: ProfileUpdateRequest, user_id: str = Depends(require_current_user_id)
) -> UserProfile:
    record = user_repository.get_by_id(user_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updates = payload.model_dump(exclude_unset=True)
    updated = user_repository.update(user_id, **updates)
    return _to_profile(updated) if updated else _to_profile(record)
