"""
Application configuration (plan.md section 12: no hardcoded secrets or
environment-specific values). All settings are read from environment
variables (optionally via a local .env file that is NEVER committed —
see .env.example for placeholders only).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "local"

    # Comma-separated list of allowed CORS origins. Defaults to the Next.js
    # frontend dev server per plan.md's frontend/backend integration.
    cors_origins: str = "http://localhost:3000"

    # Phase 1 mock-auth signing secret. This default is an explicitly
    # NON-SECRET local development placeholder (not used anywhere except a
    # developer's own machine) — override via the MOCK_AUTH_SECRET env var
    # for any shared/deployed environment. Real user auth is Phase 2
    # Cognito, not this token.
    mock_auth_secret: str = "insecure-local-dev-secret-change-me"

    # Phase 1 evidence evaluator flag. True (default) = heuristic/mocked
    # evaluator, no network calls. Flipping to False is reserved for the
    # Phase 2 Bedrock integration (not implemented yet) — see
    # app/services/evidence_evaluator.py.
    use_bedrock_mock: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
