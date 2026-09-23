"""In-memory user repository (Phase 1).

This implements the small interface a real DynamoDB-backed repository will
provide in Phase 2 (get/create/update by id or email). No boto3/DynamoDB
calls happen here — swapping in a real repository later should only
require a new class with the same method signatures, not route/service
changes.
"""

from __future__ import annotations

import uuid

from app.models.user import UserRecord


class InMemoryUserRepository:
    def __init__(self) -> None:
        self._users_by_id: dict[str, UserRecord] = {}
        self._user_id_by_email: dict[str, str] = {}

    def create(
        self,
        *,
        email: str,
        display_name: str,
        password_salt: str,
        password_hash: str,
        target_role_id: str | None = None,
        weekly_availability_hours: int = 5,
    ) -> UserRecord:
        if email in self._user_id_by_email:
            raise ValueError(f"email already registered: {email}")
        user_id = str(uuid.uuid4())
        record = UserRecord(
            id=user_id,
            email=email,
            display_name=display_name,
            password_salt=password_salt,
            password_hash=password_hash,
            target_role_id=target_role_id,
            weekly_availability_hours=weekly_availability_hours,
        )
        self._users_by_id[user_id] = record
        self._user_id_by_email[email] = user_id
        return record

    def get_by_email(self, email: str) -> UserRecord | None:
        user_id = self._user_id_by_email.get(email)
        return self._users_by_id.get(user_id) if user_id else None

    def get_by_id(self, user_id: str) -> UserRecord | None:
        return self._users_by_id.get(user_id)

    def update(self, user_id: str, **fields: object) -> UserRecord | None:
        record = self._users_by_id.get(user_id)
        if record is None:
            return None
        updated = record.model_copy(update=fields)
        self._users_by_id[user_id] = updated
        return updated

    def reset(self) -> None:
        """Test-only: clear all state between test cases."""
        self._users_by_id.clear()
        self._user_id_by_email.clear()


user_repository = InMemoryUserRepository()
