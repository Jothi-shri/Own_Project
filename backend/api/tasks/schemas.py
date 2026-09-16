"""Schemas for tasks feature."""

from __future__ import annotations

from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    projectId: str
    status: str = "todo"
    priority: str = "medium"
