"""Backwards-compatible shim — canonical implementation lives in ``backend.db.session``."""

from __future__ import annotations

from .session import Base, SessionLocal, engine, get_db

__all__ = ["Base", "SessionLocal", "engine", "get_db"]
