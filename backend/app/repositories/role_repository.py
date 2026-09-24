"""In-memory role/skill-graph repository (Phase 1).

Seeded once from app/models/role.py's SEED_ROLES. Read-only from the API's
perspective. A Phase 2 DynamoDB-backed repository would implement the same
`list_roles` / `get_role` / `get_role_model` surface.
"""

from __future__ import annotations

from app.models.role import (
    SEED_ROLES,
    LearningResourceModel,
    RoleModel,
    SkillModel,
    SuggestedProjectModel,
)
from app.schemas.role import LearningResource, Role, Skill, SuggestedProject


def _to_schema_learning_resource(model: LearningResourceModel) -> LearningResource:
    return LearningResource(
        skill_id=model.skill_id,
        video_title=model.video_title,
        youtube_url=model.youtube_url,
        note=model.note,
        curated_by=model.curated_by,
    )


def _to_schema_skill(model: SkillModel) -> Skill:
    return Skill(
        id=model.id,
        name=model.name,
        category=model.category,
        description=model.description,
        importance=model.importance,
        difficulty=model.difficulty,
        prerequisites=list(model.prerequisites),
        learning_resource=_to_schema_learning_resource(model.learning_resource),
    )


def _to_schema_project(model: SuggestedProjectModel) -> SuggestedProject:
    return SuggestedProject(
        id=model.id,
        title=model.title,
        description=model.description,
        related_skill_ids=list(model.related_skill_ids),
    )


def _to_schema_role(model: RoleModel) -> Role:
    return Role(
        id=model.id,
        name=model.name,
        description=model.description,
        skills=[_to_schema_skill(skill) for skill in model.skills],
        suggested_projects=[_to_schema_project(project) for project in model.suggested_projects],
    )


class InMemoryRoleRepository:
    def __init__(self) -> None:
        self._roles: dict[str, RoleModel] = {role.id: role for role in SEED_ROLES}

    def list_roles(self) -> list[Role]:
        return [_to_schema_role(role) for role in self._roles.values()]

    def list_role_models(self) -> list[RoleModel]:
        return list(self._roles.values())

    def get_role(self, role_id: str) -> Role | None:
        role = self._roles.get(role_id)
        return _to_schema_role(role) if role else None

    def get_role_model(self, role_id: str) -> RoleModel | None:
        return self._roles.get(role_id)

    def find_skill_model_anywhere(self, skill_id: str) -> tuple[RoleModel, SkillModel] | None:
        """Look up a skill by id across all roles (evidence submission does
        not require the caller to specify which role the skill belongs to).
        """
        for role in self._roles.values():
            for skill in role.skills:
                if skill.id == skill_id:
                    return role, skill
        return None


role_repository = InMemoryRoleRepository()
