"""SQLAlchemy engine / session factory — PostgreSQL only."""

from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from ..api.config import settings

if not settings.database_url:
    raise RuntimeError(
        "DATABASE_URL not configured. Set it in .env as "
        "postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE"
    )

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True, 
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()

def get_db():
    """FastAPI dependency — yields a DB session and closes it after request."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
