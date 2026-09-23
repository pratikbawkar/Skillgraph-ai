"""Matches SkillProgressBreakdown / SkillProgress / RoleProgress in
frontend/lib/types.ts exactly. The values here are produced solely by the
deterministic engine in app/services/progress_engine.py — never by an LLM.
"""

from app.schemas.common import CamelModel


class SkillProgressBreakdown(CamelModel):
    self_assessment: int
    objective_quiz: int
    practical_project: int
    evidence_submitted: int


class SkillProgress(CamelModel):
    skill_id: str
    breakdown: SkillProgressBreakdown
    total_percentage: int


class RoleProgress(CamelModel):
    role_id: str
    overall_percentage: int
    skill_progress: list[SkillProgress]
