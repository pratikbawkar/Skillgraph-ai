"""Internal per-user, per-skill progress-component record.

Each boolean tracks whether that component of the MVP skill-progress model
(plan.md section 2) has been completed. The deterministic scoring engine
(app/services/progress_engine.py) turns these into the weighted breakdown
shown to the user — this record only tracks raw completion state.
"""

from dataclasses import dataclass


@dataclass
class SkillProgressRecord:
    self_assessment_completed: bool = False
    objective_quiz_completed: bool = False
    practical_project_completed: bool = False
    evidence_submitted: bool = False
