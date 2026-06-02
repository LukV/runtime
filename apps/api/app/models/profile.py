"""Profile model — 1:1 with a Supabase Auth user, carrying the role."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.common import UserRole


class Profile(BaseModel):
    id: UUID
    role: UserRole
    display_name: str | None = None
    created_at: datetime
    updated_at: datetime
