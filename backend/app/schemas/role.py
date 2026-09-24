"""API schemas mirroring the Role/Skill/LearningResource/SuggestedProject
interfaces in frontend/lib/types.ts field-for-field.
"""

from typing import Literal

from app.schemas.common import CamelModel

SkillImportance = Literal["core", "important", "nice-to-have"]
SkillDifficulty = Literal["beginner", "intermediate", "advanced"]


class LearningResource(CamelModel):
    skill_id: str
    video_title: str
    youtube_url: str
    note: str | None = None
    curated_by: str


class Skill(CamelModel):
    id: str
    name: str
    category: str
    description: str
    importance: SkillImportance
    difficulty: SkillDifficulty
    prerequisites: list[str]
    learning_resource: LearningResource


class SuggestedProject(CamelModel):
    id: str
    title: str
    description: str
    related_skill_ids: list[str]


class Role(CamelModel):
    id: str
    name: str
    description: str
    skills: list[Skill]
    suggested_projects: list[SuggestedProject]
