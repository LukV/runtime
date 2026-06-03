"""Race, Distance, and Location models — the shapes the read endpoints return.

`title`/`description` are multilingual (locale-keyed maps). Location is nested
for API ergonomics; it maps to the flat location columns on the `races` table.
"""

from __future__ import annotations

# Imported as a module so the `date` field name doesn't shadow the `date` type
# in later annotations (e.g. `end_date: dt.date | None`).
import datetime as dt
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.common import Province, RaceStatus, RaceType, Translated
from app.models.organizer import PublicOrganizer


class Distance(BaseModel):
    label: str
    # Optional: relays, loops and kids runs aren't a single clean distance, so the
    # label is authoritative for display; km is set only where a distance filter
    # makes sense.
    km: float | None = None
    # The day this distance runs; None means the race's main `date`. Only set for
    # multi-day events where distances fall on different days (walk Sat / run Sun).
    date: dt.date | None = None
    start_time: dt.time | None = None
    price_eur: Decimal | None = None


class Location(BaseModel):
    label: str | None = None  # venue name, e.g. "Sporthal 't Rosco"
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
    date: dt.date
    end_date: dt.date | None = None  # multi-day events; None = single-day
    start_time: dt.time | None = None
    distances: list[Distance] = Field(default_factory=list)
    price_eur: Decimal | None = None  # optional "vanaf" entry price for sort/filter
    price_info: str | None = None  # human price truth: tiers, per-team, day-of
    edition: int | None = None  # "45e editie"
    tags: list[str] = Field(default_factory=list)  # free-form facets incl. profile/surface
    homepage: str | None = None  # event homepage, distinct from registration_url
    registration_url: str | None = None
    image_url: str | None = None
    organizer_id: UUID | None = None
    organizer_name: str | None = None
    location: Location
    status: RaceStatus
    created_at: dt.datetime
    updated_at: dt.datetime
    created_by: UUID | None = None
    updated_by: UUID | None = None


class RaceSummary(BaseModel):
    """Lightweight row for list/calendar views — no joins, no editorial body."""

    id: UUID
    slug: str
    race_type: RaceType
    title: Translated
    date: dt.date
    end_date: dt.date | None = None
    start_time: dt.time | None = None
    distances: list[Distance] = Field(default_factory=list)
    city: str
    province: Province | None = None
    edition: int | None = None
    tags: list[str] = Field(default_factory=list)
    image_url: str | None = None


class RaceDetail(Race):
    """Full race for the detail page, with the public organizer embedded."""

    organizer: PublicOrganizer | None = None


class RaceImport(BaseModel):
    """Writable race shape for the CSV importer.

    The read `Race` requires DB-generated fields (`id`, audit timestamps), so it
    can't double as the input shape. This reuses the same `Distance`/`Location`
    and enums, keeping those definitions the single source of truth.
    """

    slug: str
    race_type: RaceType
    title: Translated
    description: Translated | None = None
    date: dt.date
    end_date: dt.date | None = None
    start_time: dt.time | None = None
    distances: list[Distance] = Field(default_factory=list)
    price_eur: Decimal | None = None
    price_info: str | None = None
    edition: int | None = None
    tags: list[str] = Field(default_factory=list)
    homepage: str | None = None
    registration_url: str | None = None
    image_url: str | None = None
    organizer_name: str | None = None
    location: Location
    status: RaceStatus = RaceStatus.DRAFT
