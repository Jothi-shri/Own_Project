"""Production entry point — exposes the FastAPI application.

Vercel (Root Directory ``backend``) and uvicorn (``backend.main:app``)
both import ``app`` from here. All routes live in ``backend.api``.
"""
from backend.api.main import app  # noqa: F401

__all__ = ["app"]
