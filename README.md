# SaaS Workspace Platform

Full-stack workspace app for managing **projects, tasks, team members, analytics, notifications, and settings** — with JWT auth, a themed React UI, and a PostgreSQL-backed FastAPI API.

- **Frontend:** React 19 + Vite + Tailwind CSS v4 + Zustand + React Router (`frontend/`)
- **Backend:** FastAPI + SQLAlchemy 2 + Alembic + PostgreSQL + JWT (`backend/`)
- **Runner:** single `./run.sh` script starts both services

## Features

- **Auth:** register / login / refresh / logout, `HttpOnly` refresh cookie, protected routes (`RequireAuth`)
- **Dashboard:** stats cards, project overview, task distribution, completion chart, recent activity, upcoming tasks
- **Projects:** search, status filter, pagination, create / edit / delete, select-to-filter tasks
- **Tasks:** search, status + priority filters, project scoping, status transitions, assignees, due dates
- **Team:** search, invite / edit / remove members, role + status badges
- **Analytics:** totals, revenue-by-project, activity feed
- **Notifications:** inbox with read/unread, mark-all-read, delete
- **Settings:** profile display name, email/digest toggles, Light / Dark / Ocean themes (persisted)
- **UX:** command palette, toasts, modals, scroll-reveal + hover-zoom cards, 3-theme design tokens with reduced-motion support

## Repo structure

```text
.
├── api/index.py      # Vercel serverless entry (re-exports backend.api.main:app)
├── backend/
│   ├── api/            # FastAPI entry (main.py) + feature routers:
│   │   │               # auth, dashboard, projects, tasks, team,
│   │   │               # analytics, notifications, settings, activities
│   ├── db/             # session.py (canonical), database.py (compat shim), models.py
│   ├── services/       # business-logic layer (routers stay HTTP-thin)
│   ├── seed.py         # demo seed data (run manually, never auto-run)
│   └── main.py         # exposes `app` (uvicorn + Vercel entry)
├── frontend/
│   ├── src/
│   │   ├── pages/      # Dashboard, Projects, Tasks, Team, Analytics, Notifications, Settings
│   │   ├── components/ # layout (Sidebar/Topbar/AppLayout), ui (primitives, Modal, Toasts, CommandPalette), auth
│   │   ├── api/        # apiClient + authService (both honor VITE_API_URL)
│   │   ├── store.ts    # Zustand store + theme handling
│   │   └── tailwind.css# design tokens, card/button/badge/table, motion
│   └── vite.config.ts  # dev-only /api + /system proxy → backend :8000
├── alembic/ + alembic.ini  # DB migrations (URL comes from DATABASE_URL env)
├── pyproject.toml + requirements.txt  # backend deps (uv / Vercel Python)
├── .env.example / frontend/.env.example  # copy to .env locally, never commit .env
└── run.sh              # dev/build runner for both services
```

## Prerequisites

- Node.js ≥ 18 + npm
- Python 3.11+ with [`uv`](https://docs.astral.sh/uv/)
- PostgreSQL running locally (default DB `saas`, see `.env`)

## Quick start

```bash
# start backend (:8000) + frontend (:5173)
./run.sh

# production frontend build + preview
./run.sh --build

# force reinstall deps
./run.sh --install

# single service
./run.sh --frontend-only
./run.sh --backend-only
```

App URLs:

- Frontend → http://localhost:5173
- Backend → http://127.0.0.1:8000 (docs at `/docs`, health at `/health`)

`run.sh` will: create `.venv` if missing, `uv sync` backend deps, run `alembic upgrade head`, `npm install` if needed, wait for backend `/health`, then launch Vite.

## Manual setup

Backend:

```bash
uv sync
PYTHONPATH=. .venv/bin/python -m alembic upgrade head
PYTHONPATH=. .venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev      # or: npm run build / npm run preview
```

Seed demo data (optional):

```bash
PYTHONPATH=. .venv/bin/python backend/seed.py
```

## Environment (.env)

| Key | Purpose |
| --- | ------- |
| `DATABASE_URL` | SQLAlchemy URL, e.g. `postgresql+psycopg2://user:pass@localhost:5432/saas` |
| `JWT_SECRET` / `JWT_ALGORITHM` | signing for access + refresh tokens |
| `JWT_ACCESS_TTL_HOURS` / `JWT_REFRESH_TTL_HOURS` | token lifetimes |
| `CORS_ORIGINS` | allowed frontend origins |
| `COOKIE_SECURE` / `COOKIE_SAMESITE` | refresh-cookie flags |
| `FRONTEND_URL` | used in email links |
| `EMAIL_PROVIDER` / `RESEND_API_KEY` / `MAIL_FROM` | password-reset email delivery |

Frontend uses same-origin relative `/api` + `/system` URLs by default (Vite dev proxy).
Set `VITE_API_URL` to call a remote backend (see `frontend/.env.example`).

## Production deployment (Vercel)

No `vercel.json` is used — deployment is configured via Vercel project
settings using the current FastAPI + Vite approach. Create **two** Vercel
projects from this repo:

| Project | Root Directory | Framework / settings |
| ------- | -------------- | -------------------- |
| frontend | `frontend` | Vite preset; Build `npm run build`; Output `dist` |
| backend | repository root | Python runtime auto-detects `api/index.py` → serves FastAPI `app` |

Environment variables to set in Vercel (never commit secrets):

- **Backend project:** `DATABASE_URL` (external PostgreSQL, e.g. Neon/Supabase —
  `postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE`), `JWT_SECRET`,
  `JWT_ALGORITHM`, `JWT_ACCESS_TTL_HOURS`, `JWT_REFRESH_TTL_HOURS`,
  `CORS_ORIGINS` (must include the deployed frontend URL, e.g.
  `https://your-frontend.vercel.app`), `COOKIE_SECURE=true`,
  `COOKIE_SAMESITE=none` (required for cross-site refresh cookies),
  plus email settings (`EMAIL_PROVIDER`, `RESEND_API_KEY`, `MAIL_FROM`).
- **Frontend project:** `VITE_API_URL=https://your-backend.vercel.app`
  (no trailing slash). Both `apiClient` and `authService` prefix requests
  with it; when empty they fall back to same-origin relative URLs.

Database:

```bash
# from the project root, against the production database:
DATABASE_URL='postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE' \
  PYTHONPATH=. .venv/bin/python -m alembic upgrade head
```

PostgreSQL is the only production database — there is no SQLite /
localStorage / IndexedDB source of truth (browser storage holds only the
cached user profile, theme, and the `HttpOnly` refresh cookie).

## API overview

Auth lives under `/system/auth` (register, login, refresh, me, logout); everything else requires a Bearer access token.

| Area | Base route | Operations |
| ---- | ---------- | ---------- |
| Auth | `/system/auth` | `POST /register`, `POST /login`, `POST /refresh`, `GET /me`, `POST /logout` |
| Dashboard | `/api/dashboard` | `GET /` — stats + project overview + distribution + activity + upcoming |
| Projects | `/api/projects` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| Tasks | `/api/tasks` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| Team | `/api/team` | `GET /`, `GET /{id}`, `POST /` (invite), `PUT /{id}`, `DELETE /{id}` |
| Analytics | `/api/analytics` | `GET /` — totals + revenue by project + activity |
| Notifications | `/api/notifications` | `GET /`, `POST /`, `PUT /{id}`, `DELETE /{id}`, `POST /mark-all-read` |
| Settings | `/api/settings` | `GET /`, `PUT /` (displayName, theme, email toggles) |
| Activities | `/api/activities` | `GET /`, `POST /`, `DELETE /{id}` |
| System | `/` | `GET /health`, `GET /`, `/docs` (OpenAPI) |

DB tables (`backend/db/models.py`): `users`, `projects`, `tasks`, `team_members`, `notifications`, `activities`.

## Notes

- Auth state is rehydrated via refresh cookie on load (`initializeAuth`); stale local profiles are cleared if refresh fails.
- Theme is stored in `localStorage` + user row (`users.theme`) and applied via CSS vars on `:root[data-theme]`.
- Hover zoom comes from `.card-hover` (`translateY(-2px) scale(1.03)`); section cards on Dashboard / Analytics / Settings opt in via `<Card hover>` or `card card-hover`.
