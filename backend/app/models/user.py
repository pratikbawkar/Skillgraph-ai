"""Internal user domain record (not exposed directly via the API — see
app/schemas/user.py for the API-facing shape). Holds password hash/salt,
which must never be serialized in a response.
"""

from pydantic import BaseModel


class UserRecord(BaseModel):
    id: str
    email: str
    display_name: str
    password_salt: str
    password_hash: str
    target_role_id: str | None = None
    weekly_availability_hours: int = 5
