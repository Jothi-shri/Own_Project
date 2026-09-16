from __future__ import annotations

from backend.db.database import SessionLocal


def seed_users(db) -> int:
    return 0


def main() -> None:
    print("[seed] Seeding PostgreSQL via SQLAlchemy...")
    db = SessionLocal()
    try:
        created = seed_users(db)
        if created == 0:
            print("[seed] No new users — already seeded.")
        else:
            print(f"[seed] Created {created} new user(s).")
        print("[seed] Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
