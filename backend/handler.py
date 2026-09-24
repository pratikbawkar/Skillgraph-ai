"""AWS Lambda handler for SkillGraph AI backend.

Exports the FastAPI application wrapped with Mangum ASGI adapter for AWS Lambda.
For local development, run FastAPI directly with uvicorn (see app/main.py).
For Phase 2 AWS deployment, Lambda invokes this handler.
"""

from mangum import Mangum

from app.main import app

handler = Mangum(app)
