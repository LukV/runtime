"""Organizer model — the organising entity a race points at (distinct from the
organizer *role* a user holds). `contact_email` is internal; read endpoints omit
it from public responses."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.common import OrganizerType


class Organizer(BaseModel):
    id: UUID
    name: str
    type: OrganizerType
    website: str | None = None
    contact_email: str | None = None
    owner_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
    created_by: UUID | None = None
    updated_by: UUID | None = None


class PublicOrganizer(BaseModel):
    """The organizer fields safe to expose on a public race page — notably
    without `contact_email`."""

    id: UUID
    name: str
    type: OrganizerType
    website: str | None = None
