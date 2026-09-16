"""Projects routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..auth.security import get_current_user
from ...db.models import User

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("")
def list_projects(user: User = Depends(get_current_user)):
    return {"projects": [], "user": user.public()}


@router.get("/{project_id}")
def get_project(project_id: str, user: User = Depends(get_current_user)):
    return {"project": {"id": project_id, "name": "Demo Project", "status": "active"}, "user": user.public()}


@router.post("")
def create_project(payload: dict, user: User = Depends(get_current_user)):
    return {"project": {"id": "p-new", **payload}, "user": user.public()}
