"""Dashboard routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..auth.security import get_current_user
from ...db.models import User
from .schemas import DashboardStats

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard")
def get_dashboard(user: User = Depends(get_current_user)):
    # Mock stats — real implementation would query DB
    return {
        "stats": DashboardStats(
            totalProjects=12,
            completedTasks=87,
            activeTeamMembers=8,
            revenueGrowth=14.2,
        ).model_dump(),
        "user": user.public(),
    }


@router.get("/me")
def api_me(user: User = Depends(get_current_user)):
    # Preserved from main.py for backward compatibility
    return user.public()
