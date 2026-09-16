"""Seed demo data — idempotent, PostgreSQL + SQLAlchemy.

Usage:
    PYTHONPATH=. .venv/bin/python -m backend.seed
    # or
    .venv/bin/python backend/seed.py

Safe to run multiple times — checks for existing records before insert.
"""

from __future__ import annotations

import secrets

from sqlalchemy import func, select

from backend.db.database import SessionLocal
from backend.db.models import User
from backend.api.auth.security import hash_password


def _next_user_id() -> str:
    return f"USR-{secrets.token_hex(3).upper()}"


SEED_USERS = [
    {
        "name": "Admin User",
        "email": "admin@saas.local",
        "password": "AdminPass123",
        "role": "Admin",
        "status": "Active",
    },
    {
        "name": "Demo Analyst",
        "email": "analyst@saas.local",
        "password": "AnalystPass123",
        "role": "Analyst",
        "status": "Active",
    },
    {
        "name": "Demo Technician",
        "email": "tech@saas.local",
        "password": "TechPass123",
        "role": "Technician",
        "status": "Active",
    },
    {
        "name": "Demo Supervisor",
        "email": "supervisor@saas.local",
        "password": "Supervisor123",
        "role": "Supervisor",
        "status": "Active",
    },
]

# Placeholder for future project/task seeds — kept separate from migrations
# Currently only User table exists; project/task data is mocked in frontend.
# When those tables are added, extend this file with similar idempotent inserts.


def seed_users(db) -> int:
    created = 0
    for u in SEED_USERS:
        email = u["email"].lower().strip()
        exists = db.scalar(select(User).where(func.lower(User.email) == email))
        if exists:
            # Update role/password if needed? For idempotency, skip
            continue
        user = User(
            id=_next_user_id(),
            name=u["name"],
            email=email,
            password_hash=hash_password(u["password"]),
            role=u["role"],
            status=u["status"],
        )
        db.add(user)
        try:
            db.commit()
        except Exception:
            db.rollback()
            # Race condition — check again
            if db.scalar(select(User).where(func.lower(User.email) == email)):
                continue
            raise
        else:
            created += 1
            print(f"  + user {email} ({u['role']})")
    return created


def main() -> None:
    print("[seed] Seeding PostgreSQL via SQLAlchemy...")
    db = SessionLocal()
    try:
        # Ensure tables exist (Alembic should have run, but be safe)
        from backend.db.database import engine
        from backend.db.models import User as _User

        # Seed users
        created = seed_users(db)
        if created == 0:
            print("[seed] No new users — already seeded.")
        else:
            print(f"[seed] Created {created} new user(s).")

        # Future: seed projects/tasks/team/analytics/notifications/settings
        # Example (when tables exist):
        #   if not db.scalar(select(Project).limit(1)):
        #       ...

        print("[seed] Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
