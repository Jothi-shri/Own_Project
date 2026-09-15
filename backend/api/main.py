"""FastAPI entry point."""

from __future__ import annotations

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from ..db.database import Base, engine
from .auth import router as auth_router
from .security import get_current_user
from ..db.models import User
from .config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SaaS API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

app.include_router(auth_router)

@app.get("/api/me")
def api_me(user: User = Depends(get_current_user)):
    return user.public()

@app.get("/api/projects")
def list_projects(user: User = Depends(get_current_user)):
    return {"projects": [], "user": user.public()}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "SaaS API running. See /docs for OpenAPI."}
