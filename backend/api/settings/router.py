"""Settings routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..auth.security import get_current_user
from ...db.models import User

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
def get_settings(user: User = Depends(get_current_user)):
    return {"settings": {"theme": "dark", "notificationsEnabled": True}, "user": user.public()}


@router.put("")
def update_settings(payload: dict, user: User = Depends(get_current_user)):
    return {"settings": payload, "user": user.public()}
