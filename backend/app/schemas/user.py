"""Matches the `UserProfile` interface in frontend/lib/types.ts exactly:
id, email, displayName, targetRoleId, weeklyAvailabilityHours.
"""

from pydantic import Field

from app.schemas.common import CamelModel


class UserProfile(CamelModel):
    id: str
    email: str
    display_name: str
    target_role_id: str | None = None
    weekly_availability_hours: int


class ProfileUpdateRequest(CamelModel):
    """Partial update payload for PUT /profile. All fields optional."""

    display_name: str | None = Field(default=None, min_length=1)
    target_role_id: str | None = None
    weekly_availability_hours: int | None = Field(default=None, ge=0, le=168)
