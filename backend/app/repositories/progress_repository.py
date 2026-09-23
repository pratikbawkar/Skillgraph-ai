"""In-memory per-user skill-progress-component repository (Phase 1).

Stores only raw completion flags per (user_id, skill_id). The deterministic
scoring in app/services/progress_engine.py turns these into the weighted
breakdown/percentage shown to the user. A Phase 2 DynamoDB-backed
repository would implement the same get/mark/reset surface.
"""

from __future__ import annotations

from app.models.progress import SkillProgressRecord
from app.models.role import RoleModel
from app.repositories.role_repository import role_repository

# TODO(Phase 2): replace with the real authenticated user's id once Cognito
# auth is wired end-to-end. For Phase 1, unauthenticated/mocked callers to
# the progress and evidence endpoints fall back to this seeded demo user so
# the API is demoable without a full login flow.
DEMO_USER_ID = "demo-user"


class InMemoryProgressRepository:
    def __init__(self) -> None:
        self._records: dict[tuple[str, str], SkillProgressRecord] = {}

    def get(self, user_id: str, skill_id: str) -> SkillProgressRecord:
        key = (user_id, skill_id)
        if key not in self._records:
            self._records[key] = SkillProgressRecord()
        return self._records[key]

    def set_record(self, user_id: str, skill_id: str, **fields: bool) -> SkillProgressRecord:
        record = self.get(user_id, skill_id)
        for field_name, value in fields.items():
            setattr(record, field_name, value)
        return record

    def mark_evidence_submitted(self, user_id: str, skill_id: str) -> None:
        self.set_record(user_id, skill_id, evidence_submitted=True)

    def reset(self) -> None:
        """Test-only: clear all state between test cases."""
        self._records.clear()

    def seed_demo_data(self, roles: list[RoleModel]) -> None:
        """Seed varied demo progress for DEMO_USER_ID so GET .../progress is
        demoable out of the box without a full assessment/quiz/project flow.
        Mirrors the alternating pattern used by the frontend's local mock
        (frontend/lib/mock-data.ts getMockRoleProgress) for a consistent
        demo experience across both sides.
        """
        for role in roles:
            for index, skill in enumerate(role.skills):
                self.set_record(
                    DEMO_USER_ID,
                    skill.id,
                    self_assessment_completed=(index % 2 == 0),
                    objective_quiz_completed=(index % 3 == 0),
                    practical_project_completed=(index == 0),
                    evidence_submitted=False,
                )


progress_repository = InMemoryProgressRepository()
progress_repository.seed_demo_data(role_repository.list_role_models())
