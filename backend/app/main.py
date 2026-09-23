"""SkillGraph AI backend — FastAPI application entrypoint.

Phase 1 (plan.md sections 3 and 20, items 7-11): everything reachable from
this app is local/in-memory. No live AWS calls (Cognito, DynamoDB, S3,
Bedrock) are made anywhere in the default code path:

- Auth is a mocked, HMAC-signed opaque token, not Cognito
  (see app/core/security.py).
- The skill graph and user/progress data live in in-memory repositories
  (see app/repositories/*.py), each shaped like the interface a Phase 2
  DynamoDB-backed repository will implement.
- Evidence evaluation is a keyword-overlap heuristic, not Bedrock
  (see app/services/evidence_evaluator.py), gated behind USE_BEDROCK_MOCK
  (defaults to true).

Run locally with: `uvicorn app.main:app --reload --port 8000`
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, evidence, health, profiles, roles
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="SkillGraph AI API",
        description="Phase 1 local/mocked backend for SkillGraph AI. See plan.md.",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(profiles.router)
    app.include_router(roles.router)
    app.include_router(evidence.router)

    return app


app = create_app()
