"""Unit tests for the deterministic skill-progress scoring engine
(plan.md section 2). This is the most important business rule in the
plan: it must be pure, deterministic, and never involve an LLM.
"""

from app.services.progress_engine import (
    EVIDENCE_SUBMITTED_WEIGHT,
    OBJECTIVE_QUIZ_WEIGHT,
    PRACTICAL_PROJECT_WEIGHT,
    SELF_ASSESSMENT_WEIGHT,
    compute_role_progress,
    compute_skill_progress,
)


def test_all_zero_breakdown_when_nothing_completed():
    result = compute_skill_progress(
        "skill-1",
        self_assessment_completed=False,
        objective_quiz_completed=False,
        practical_project_completed=False,
        evidence_submitted=False,
    )
    assert result.breakdown.self_assessment == 0
    assert result.breakdown.objective_quiz == 0
    assert result.breakdown.practical_project == 0
    assert result.breakdown.evidence_submitted == 0
    assert result.total_percentage == 0


def test_all_max_breakdown_when_everything_completed():
    result = compute_skill_progress(
        "skill-1",
        self_assessment_completed=True,
        objective_quiz_completed=True,
        practical_project_completed=True,
        evidence_submitted=True,
    )
    assert result.breakdown.self_assessment == SELF_ASSESSMENT_WEIGHT
    assert result.breakdown.objective_quiz == OBJECTIVE_QUIZ_WEIGHT
    assert result.breakdown.practical_project == PRACTICAL_PROJECT_WEIGHT
    assert result.breakdown.evidence_submitted == EVIDENCE_SUBMITTED_WEIGHT
    assert result.total_percentage == 100


def test_partial_completion_self_assessment_and_quiz_only():
    result = compute_skill_progress(
        "skill-1",
        self_assessment_completed=True,
        objective_quiz_completed=True,
        practical_project_completed=False,
        evidence_submitted=False,
    )
    assert result.breakdown.self_assessment == 20
    assert result.breakdown.objective_quiz == 30
    assert result.breakdown.practical_project == 0
    assert result.breakdown.evidence_submitted == 0
    assert result.total_percentage == 50


def test_partial_completion_evidence_only():
    result = compute_skill_progress(
        "skill-1",
        self_assessment_completed=False,
        objective_quiz_completed=False,
        practical_project_completed=False,
        evidence_submitted=True,
    )
    assert result.total_percentage == 20


def test_partial_completion_project_only():
    result = compute_skill_progress(
        "skill-1",
        self_assessment_completed=False,
        objective_quiz_completed=False,
        practical_project_completed=True,
        evidence_submitted=False,
    )
    assert result.total_percentage == 30


def test_missing_component_contributes_zero_not_partial_credit():
    # Completing 3 of 4 components must never silently round up to 100.
    result = compute_skill_progress(
        "skill-1",
        self_assessment_completed=True,
        objective_quiz_completed=True,
        practical_project_completed=True,
        evidence_submitted=False,
    )
    assert result.total_percentage == 80
    assert result.breakdown.evidence_submitted == 0


def test_skill_progress_is_deterministic_for_same_inputs():
    kwargs = dict(
        self_assessment_completed=True,
        objective_quiz_completed=False,
        practical_project_completed=True,
        evidence_submitted=False,
    )
    first = compute_skill_progress("skill-1", **kwargs)
    second = compute_skill_progress("skill-1", **kwargs)
    assert first == second


def test_role_progress_empty_skill_list_is_zero():
    role_progress = compute_role_progress("some-role", [])
    assert role_progress.overall_percentage == 0
    assert role_progress.skill_progress == []


def test_role_progress_is_average_of_skill_totals():
    skills = [
        compute_skill_progress(
            "skill-1",
            self_assessment_completed=True,
            objective_quiz_completed=True,
            practical_project_completed=True,
            evidence_submitted=True,
        ),
        compute_skill_progress(
            "skill-2",
            self_assessment_completed=False,
            objective_quiz_completed=False,
            practical_project_completed=False,
            evidence_submitted=False,
        ),
    ]
    role_progress = compute_role_progress("some-role", skills)
    assert role_progress.overall_percentage == 50
    assert role_progress.role_id == "some-role"
    assert len(role_progress.skill_progress) == 2


def test_role_progress_rounds_half_up_not_banker_rounding():
    # Four skills totalling 0 + 30 + 40 + 40 = 110 -> average 27.5.
    # Python's built-in round() would give 28 here too (nearest even), so
    # use a case where banker's rounding would diverge: 0 + 20 + 30 + 40 = 90
    # -> average 22.5. round() rounds to nearest even (22); our engine must
    # round half up to 23, matching the frontend's Math.round semantics.
    skills = [
        compute_skill_progress(
            "s1",
            self_assessment_completed=False,
            objective_quiz_completed=False,
            practical_project_completed=False,
            evidence_submitted=False,
        ),  # 0
        compute_skill_progress(
            "s2",
            self_assessment_completed=True,
            objective_quiz_completed=False,
            practical_project_completed=False,
            evidence_submitted=False,
        ),  # 20
        compute_skill_progress(
            "s3",
            self_assessment_completed=False,
            objective_quiz_completed=True,
            practical_project_completed=False,
            evidence_submitted=False,
        ),  # 30
        compute_skill_progress(
            "s4",
            self_assessment_completed=True,
            objective_quiz_completed=False,
            practical_project_completed=False,
            evidence_submitted=True,
        ),  # 40
    ]
    totals = [s.total_percentage for s in skills]
    assert totals == [0, 20, 30, 40]
    assert sum(totals) / len(totals) == 22.5
    assert round(22.5) == 22  # Python's banker's rounding, for contrast

    role_progress = compute_role_progress("some-role", skills)
    assert role_progress.overall_percentage == 23
