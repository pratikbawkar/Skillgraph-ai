"""Unit tests for the Phase 1 heuristic evidence evaluator. Confirms it
never returns a hard pass/fail — only summary/findings + confidence.
"""

import pytest

from app.models.role import LearningResourceModel, SkillModel
from app.services.evidence_evaluator import evaluate_evidence

_SKILL = SkillModel(
    id="pd-testing",
    name="Testing with pytest",
    category="Quality",
    description="Unit tests, fixtures, mocking.",
    importance="core",
    difficulty="intermediate",
    prerequisites=("pd-core-python",),
    learning_resource=LearningResourceModel(
        skill_id="pd-testing",
        video_title="DRAFT: pytest in Practice",
        youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_11",
        curated_by="draft-pending-review",
    ),
)


def test_never_returns_pass_fail_field():
    finding = evaluate_evidence(
        skill=_SKILL, description="I wrote pytest fixtures for mocking", links=[]
    )
    # The schema itself has no pass/fail field; assert the only verdict-like
    # field present is a confidence level, not a boolean pass/fail.
    dumped = finding.model_dump()
    assert "pass" not in dumped
    assert "failed" not in dumped
    assert finding.confidence in {"low", "medium", "high"}


def test_high_overlap_with_link_yields_high_confidence():
    finding = evaluate_evidence(
        skill=_SKILL,
        description="Wrote pytest unit tests with fixtures and mocking for the project",
        links=["https://github.com/example/repo"],
    )
    assert finding.confidence == "high"
    assert "pytest" in finding.matched_criteria or "testing" in finding.matched_criteria
    assert finding.relevant_skill_ids == ["pd-testing"]


def test_no_overlap_no_link_yields_low_confidence():
    finding = evaluate_evidence(skill=_SKILL, description="baked a cake today", links=[])
    assert finding.confidence == "low"


def test_link_only_no_keyword_overlap_yields_medium_confidence():
    finding = evaluate_evidence(
        skill=_SKILL, description="baked a cake today", links=["https://example.com"]
    )
    assert finding.confidence == "medium"


def test_missing_criteria_lists_skill_keywords_not_mentioned():
    finding = evaluate_evidence(skill=_SKILL, description="pytest", links=[])
    assert "fixtures" in finding.missing_criteria or "mocking" in finding.missing_criteria


def test_evaluator_is_deterministic_for_same_inputs():
    first = evaluate_evidence(skill=_SKILL, description="pytest fixtures mocking", links=[])
    second = evaluate_evidence(skill=_SKILL, description="pytest fixtures mocking", links=[])
    assert first == second


def test_raises_when_bedrock_mock_disabled(monkeypatch):
    from app.core import config

    config.get_settings.cache_clear()
    monkeypatch.setenv("USE_BEDROCK_MOCK", "false")
    try:
        with pytest.raises(NotImplementedError):
            evaluate_evidence(skill=_SKILL, description="pytest", links=[])
    finally:
        config.get_settings.cache_clear()
