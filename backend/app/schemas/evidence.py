"""Matches EvidenceSubmission / EvidenceFinding / EvidenceEvaluation in
frontend/lib/types.ts exactly.

Per plan.md section 2/16: evaluation must never be an automatic hard
pass/fail. `EvidenceFinding` only ever carries a summary, matched/missing
criteria, and a confidence level.
"""

from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel

EvidenceConfidence = Literal["low", "medium", "high"]


class EvidenceSubmissionRequest(CamelModel):
    skill_id: str = Field(min_length=1)
    description: str = Field(min_length=1, max_length=4000)
    links: list[str] = Field(default_factory=list)


class EvidenceSubmission(CamelModel):
    id: str
    skill_id: str
    description: str
    links: list[str]
    submitted_at: str


class EvidenceFinding(CamelModel):
    summary: str
    relevant_skill_ids: list[str]
    matched_criteria: list[str]
    missing_criteria: list[str]
    confidence: EvidenceConfidence


class EvidenceEvaluation(CamelModel):
    submission_id: str
    findings: EvidenceFinding
    evaluated_at: str
