"""Race, Distance, and Location models — the shapes the read endpoints return.

`title`/`description` are multilingual (locale-keyed maps). Location is nested
for API ergonomics; it maps to the flat location columns on the `races` table.
"""

from __future__ import annotations

from datetime import date, datetime, time
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.common import Province, RaceStatus, RaceType, Translated


class Distance(BaseModel):
    label: str
    km: float
    start_time: time | None = None
    price_eur: Decimal | None = None


class Location(BaseModel):
    country: str = "BE"
    city: str
    province: Province | None = None
    postal_code: str | None = None
    street: str | None = None
    house_nr: str | None = None
    lat: float | None = None
    lng: float | None = None


class Race(BaseModel):
    id: UUID
    slug: str
    race_type: RaceType
    title: Translated
    description: Translated | None = None
    date: date
    start_time: time | None = None
    distances: list[Distance] = Field(default_factory=list)
    price_eur: Decimal | None = None
    registration_url: str | None = None
    image_url: str | None = None
    organizer_id: UUID | None = None
    organizer_name: str | None = None
    location: Location
    status: RaceStatus
    created_at: datetime
    updated_at: datetime
    created_by: UUID | None = None
    updated_by: UUID | None = None
