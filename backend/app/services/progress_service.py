"""Wires the role graph + per-user progress records into the deterministic
progress engine to answer `GET /roles/{roleId}/progress`.
"""

from __future__ import annotations

from app.repositories.progress_repository import InMemoryProgressRepository
from app.repositories.role_repository import InMemoryRoleRepository
from app.schemas.progress import RoleProgress
from app.services.progress_engine import compute_role_progress, compute_skill_progress


def get_role_progress(
    role_id: str,
    user_id: str,
    role_repository: InMemoryRoleRepository,
    progress_repository: InMemoryProgressRepository,
) -> RoleProgress | None:
    role_model = role_repository.get_role_model(role_id)
    if role_model is None:
        return None

    skill_progress = []
    for skill in role_model.skills:
        record = progress_repository.get(user_id, skill.id)
        skill_progress.append(
            compute_skill_progress(
                skill.id,
                self_assessment_completed=record.self_assessment_completed,
                objective_quiz_completed=record.objective_quiz_completed,
                practical_project_completed=record.practical_project_completed,
                evidence_submitted=record.evidence_submitted,
            )
        )

    return compute_role_progress(role_id, skill_progress)
