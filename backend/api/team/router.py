"""Team routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..auth.security import get_current_user
from ...db.models import User

router = APIRouter(prefix="/api/team", tags=["team"])


@router.get("")
def list_team(user: User = Depends(get_current_user)):
    return {"members": [], "user": user.public()}


@router.post("")
def invite_member(payload: dict, user: User = Depends(get_current_user)):
    return {"member": {"id": "tm-new", **payload}, "user": user.public()}
