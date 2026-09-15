"""Central settings for JWT, cookies, CORS and database — env-driven."""

from __future__ import annotations

import os

_DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "saas.db")

def _env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).lower() in ("1", "true", "yes", "on")

class Settings:
    jwt_secret: str = os.getenv("JWT_SECRET", "dev-super-secret-change-in-production-please-32chars")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_ttl_hours: float = float(os.getenv("JWT_ACCESS_TTL_HOURS", "0.25"))
    jwt_refresh_ttl_hours: float = float(os.getenv("JWT_REFRESH_TTL_HOURS", "168"))

    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB_PATH}")

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

settings = Settings()
