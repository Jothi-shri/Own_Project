"""Notifications routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..auth.security import get_current_user
from ...db.models import User

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
def list_notifications(user: User = Depends(get_current_user)):
    return {"notifications": [], "user": user.public()}
