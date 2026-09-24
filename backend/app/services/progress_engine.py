"""Deterministic skill-progress scoring engine (plan.md section 2, "MVP
skill-progress model" — the most important business rule in the plan).

    Self assessment     20%
    Objective quiz      30%
    Practical project   30%
    Evidence submitted  20%
    --------------------------
    Skill progress       100%

Rules enforced here:
- A missing/incomplete component contributes exactly 0.
- The full breakdown is always returned alongside the total, never just
  the total (the UI must show which components contributed).
- This module is 100% pure: no I/O, no randomness, no AI/LLM calls. Given
  the same inputs it always returns the same output. The weights below may
  only change through a documented ADR per plan.md.
"""

from __future__ import annotations

import math

from app.schemas.progress import RoleProgress, SkillProgress, SkillProgressBreakdown

SELF_ASSESSMENT_WEIGHT = 20
OBJECTIVE_QUIZ_WEIGHT = 30
PRACTICAL_PROJECT_WEIGHT = 30
EVIDENCE_SUBMITTED_WEIGHT = 20

TOTAL_WEIGHT = (
    SELF_ASSESSMENT_WEIGHT
    + OBJECTIVE_QUIZ_WEIGHT
    + PRACTICAL_PROJECT_WEIGHT
    + EVIDENCE_SUBMITTED_WEIGHT
)
assert TOTAL_WEIGHT == 100, "skill-progress weights must sum to 100 (plan.md section 2)"


def compute_skill_progress(
    skill_id: str,
    *,
    self_assessment_completed: bool,
    objective_quiz_completed: bool,
    practical_project_completed: bool,
    evidence_submitted: bool,
) -> SkillProgress:
    """Compute one skill's deterministic progress breakdown and total."""
    breakdown = SkillProgressBreakdown(
        self_assessment=SELF_ASSESSMENT_WEIGHT if self_assessment_completed else 0,
        objective_quiz=OBJECTIVE_QUIZ_WEIGHT if objective_quiz_completed else 0,
        practical_project=PRACTICAL_PROJECT_WEIGHT if practical_project_completed else 0,
        evidence_submitted=EVIDENCE_SUBMITTED_WEIGHT if evidence_submitted else 0,
    )
    total = (
        breakdown.self_assessment
        + breakdown.objective_quiz
        + breakdown.practical_project
        + breakdown.evidence_submitted
    )
    return SkillProgress(skill_id=skill_id, breakdown=breakdown, total_percentage=total)


def _round_half_up(value: float) -> int:
    """Round half up (not Python's banker's rounding) to match the
    frontend's `Math.round` semantics exactly for the overall percentage.
    """
    return math.floor(value + 0.5)


def compute_role_progress(role_id: str, skill_progress: list[SkillProgress]) -> RoleProgress:
    """Derive the overall role-progress percentage from the progress of the
    skills required by that role (plan.md section 2, MVP goal 12).
    """
    if not skill_progress:
        overall_percentage = 0
    else:
        overall_percentage = _round_half_up(
            sum(sp.total_percentage for sp in skill_progress) / len(skill_progress)
        )
    return RoleProgress(
        role_id=role_id,
        overall_percentage=overall_percentage,
        skill_progress=skill_progress,
    )
