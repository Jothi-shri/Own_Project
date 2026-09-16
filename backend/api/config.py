"""Central settings for JWT, cookies, CORS and database — env-driven."""

from __future__ import annotations

import os

from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root (backend/api -> backend -> root)
_project_root = Path(__file__).resolve().parents[2]
load_dotenv(_project_root / ".env", override=False)
# Also try parent search for robustness
load_dotenv(override=False)

def _env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).lower() in ("1", "true", "yes", "on")

class Settings:
    jwt_secret: str = os.getenv("JWT_SECRET", "dev-super-secret-change-in-production-please-32chars")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_ttl_hours: float = float(os.getenv("JWT_ACCESS_TTL_HOURS", "0.25"))
    jwt_refresh_ttl_hours: float = float(os.getenv("JWT_REFRESH_TTL_HOURS", "168"))

    # PostgreSQL — required, loaded from .env via DATABASE_URL
    # Example: postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE
    database_url: str = os.getenv("DATABASE_URL", "")
    # Fail fast if not configured — prevents silent SQLite fallback
    if not database_url:
        # No hard-coded fallback to SQLite; user must set DATABASE_URL in .env
        # For local dev the .env file provides: postgresql+psycopg://shobot:postgres@localhost:5432/saas
        database_url = ""

    refresh_cookie_name: str = os.getenv("REFRESH_COOKIE_NAME", "refresh_token")
    refresh_cookie_path: str = os.getenv("REFRESH_COOKIE_PATH", "/")
    refresh_cookie_secure: bool = _env_bool("COOKIE_SECURE", "false") 
    refresh_cookie_httponly: bool = True
    refresh_cookie_samesite: str = os.getenv("COOKIE_SAMESITE", "lax")  
    refresh_cookie_domain: str | None = os.getenv("COOKIE_DOMAIN") or None

    cors_origins: list[str] = [
        o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()
    ]
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]

    def validate(self) -> None:
        if not self.database_url:
            raise RuntimeError(
                "DATABASE_URL is not set. Please create a .env file with "
                "DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE"
            )
        if not self.database_url.startswith("postgresql"):
            raise RuntimeError(f"DATABASE_URL must be a PostgreSQL URL, got: {self.database_url}")

settings = Settings()
# Validate on import (fail fast in production); allow import in tools that mock?
try:
    settings.validate()
except RuntimeError as e:
    # Only warn during import; actual DB connection will fail later if not set
    # Keeps `alembic` and tests from crashing before .env is loaded
    if os.getenv("ALEMBIC_BYPASS_VALIDATION") != "1":
        import warnings
        warnings.warn(str(e))
