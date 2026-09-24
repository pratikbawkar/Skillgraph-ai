"""Phase 1 MOCK auth schemas — see app/core/security.py for the
non-Cognito, HMAC-signed mock token this API issues.
"""

from pydantic import EmailStr, Field

from app.schemas.common import CamelModel
from app.schemas.user import UserProfile


class RegisterRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=100)


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1)


class AuthResponse(CamelModel):
    token: str
    user: UserProfile
