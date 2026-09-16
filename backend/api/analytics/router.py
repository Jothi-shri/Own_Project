"""Analytics routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..auth.security import get_current_user
from ...db.models import User

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("")
def get_analytics(user: User = Depends(get_current_user)):
    return {
        "analytics": {
            "totalProjects": 12,
            "completedTasks": 87,
            "activeTeamMembers": 8,
            "revenueGrowth": 14.2,
        },
        "user": user.public(),
    }
