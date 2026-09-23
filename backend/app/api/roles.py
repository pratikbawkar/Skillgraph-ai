"""Skill graph + deterministic progress endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import optional_current_user_id
from app.repositories.progress_repository import DEMO_USER_ID, progress_repository
from app.repositories.role_repository import role_repository
from app.schemas.progress import RoleProgress
from app.schemas.role import Role
from app.services.progress_service import get_role_progress

router = APIRouter(tags=["roles"])


@router.get("/roles", response_model=list[Role])
def list_roles() -> list[Role]:
    return role_repository.list_roles()


@router.get("/roles/{role_id}", response_model=Role)
def get_role(role_id: str) -> Role:
    role = role_repository.get_role(role_id)
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{role_id}' not found"
        )
    return role


@router.get("/roles/{role_id}/progress", response_model=RoleProgress)
def get_progress(
    role_id: str,
    user_id: str | None = Query(
        default=None,
        description=(
            "Phase 1 only: override which seeded user's progress to view. "
            "TODO(Phase 2): remove once progress is always derived from the "
            "authenticated Cognito session instead of a query param/demo user."
        ),
    ),
    token_user_id: str | None = Depends(optional_current_user_id),
) -> RoleProgress:
    effective_user_id = token_user_id or user_id or DEMO_USER_ID
    progress = get_role_progress(role_id, effective_user_id, role_repository, progress_repository)
    if progress is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{role_id}' not found"
        )
    return progress
