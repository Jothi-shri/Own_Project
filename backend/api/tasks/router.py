"""Tasks routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..auth.security import get_current_user
from ...db.models import User

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("")
def list_tasks(user: User = Depends(get_current_user)):
    return {"tasks": [], "user": user.public()}


@router.post("")
def create_task(payload: dict, user: User = Depends(get_current_user)):
    return {"task": {"id": "t-new", **payload}, "user": user.public()}
