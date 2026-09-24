"""Evidence evaluator (plan.md section 2 / section 16).

Hard rule: evaluation must NEVER be an automatic hard pass/fail. This
service only summarizes/highlights findings and reports a confidence
level; it never sets or overrides the deterministic progress score itself
(see app/services/progress_engine.py for that).

Phase 1 (today): a mocked/heuristic evaluator — plain keyword overlap
between the submitted description/links and the target skill's
name/description/category. No network calls, no LLM, no boto3.

Phase 2 TODO: swap `_evaluate_heuristic` for a real Amazon Bedrock call
behind the same `evaluate_evidence()` seam below, gated by flipping
USE_BEDROCK_MOCK to false once that integration exists. Do not add a live
Bedrock/boto3 call anywhere else in the codebase — this module is the only
intended seam.
"""

from __future__ import annotations

import re

from app.core.config import get_settings
from app.models.role import SkillModel
from app.schemas.evidence import EvidenceConfidence, EvidenceFinding

_WORD_RE = re.compile(r"[a-zA-Z0-9]+")
_MIN_KEYWORD_LENGTH = 3


def _tokenize(text: str) -> set[str]:
    return {word.lower() for word in _WORD_RE.findall(text) if len(word) >= _MIN_KEYWORD_LENGTH}


def evaluate_evidence(*, skill: SkillModel, description: str, links: list[str]) -> EvidenceFinding:
    settings = get_settings()
    if not settings.use_bedrock_mock:
        # Phase 2 seam — intentionally not implemented in Phase 1. See the
        # module docstring above.
        raise NotImplementedError(
            "USE_BEDROCK_MOCK=false requires the Phase 2 Bedrock integration, "
            "which has not been implemented yet. Set USE_BEDROCK_MOCK=true "
            "(the default) for Phase 1."
        )
    return _evaluate_heuristic(skill=skill, description=description, links=links)


def _evaluate_heuristic(
    *, skill: SkillModel, description: str, links: list[str]
) -> EvidenceFinding:
    skill_keywords = _tokenize(f"{skill.name} {skill.description} {skill.category}")
    submission_keywords = _tokenize(f"{description} {' '.join(links)}")

    matched = sorted(skill_keywords & submission_keywords)
    missing = sorted(skill_keywords - submission_keywords)
    has_link = any(link.strip() for link in links)
    overlap_ratio = len(matched) / len(skill_keywords) if skill_keywords else 0.0

    confidence: EvidenceConfidence
    if overlap_ratio >= 0.5 and has_link:
        confidence = "high"
    elif overlap_ratio >= 0.2 or has_link:
        confidence = "medium"
    else:
        confidence = "low"

    link_note = (
        "and includes supporting link(s)." if has_link else "but includes no supporting links."
    )
    summary = (
        f"Evidence for '{skill.name}' mentions {len(matched)} of {len(skill_keywords)} "
        f"key terms from the skill description, {link_note}"
    )

    return EvidenceFinding(
        summary=summary,
        relevant_skill_ids=[skill.id],
        matched_criteria=matched,
        missing_criteria=missing,
        confidence=confidence,
    )
