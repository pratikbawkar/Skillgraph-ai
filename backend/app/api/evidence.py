"""Evidence submission endpoint.

Per plan.md section 2/16: this never produces an automatic hard pass/fail.
It returns a summarized, confidence-scored evaluation (see
app/services/evidence_evaluator.py) and separately marks the "evidence
submitted" component of the deterministic progress model as complete.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import optional_current_user_id
from app.repositories.progress_repository import DEMO_USER_ID, progress_repository
from app.repositories.role_repository import role_repository
from app.schemas.evidence import EvidenceEvaluation, EvidenceSubmissionRequest
from app.services.evidence_evaluator import evaluate_evidence

router = APIRouter(prefix="/evidence", tags=["evidence"])


@router.post("", response_model=EvidenceEvaluation, status_code=status.HTTP_201_CREATED)
def submit_evidence(
    payload: EvidenceSubmissionRequest,
    # TODO(Phase 2): require real Cognito-authenticated auth here instead of
    # falling back to a seeded demo user once the frontend wires up a real
    # end-to-end login flow.
    token_user_id: str | None = Depends(optional_current_user_id),
) -> EvidenceEvaluation:
    found = role_repository.find_skill_model_anywhere(payload.skill_id)
    if found is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill '{payload.skill_id}' not found",
        )
    _, skill = found

    effective_user_id = token_user_id or DEMO_USER_ID
    progress_repository.mark_evidence_submitted(effective_user_id, payload.skill_id)

    findings = evaluate_evidence(skill=skill, description=payload.description, links=payload.links)

    return EvidenceEvaluation(
        submission_id=f"evidence-{uuid.uuid4()}",
        findings=findings,
        evaluated_at=datetime.now(UTC).isoformat(),
    )
