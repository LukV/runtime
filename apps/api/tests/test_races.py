"""Surface tests for the race endpoints. The data-access layer is faked via
dependency_overrides, so these run without a database."""

from __future__ import annotations

from datetime import UTC, date, datetime

import httpx
from fastapi import FastAPI

from app.dependencies import get_race_repo
from app.models import Location, PublicOrganizer, RaceDetail, RaceSummary
from app.routes.races import router as races_router

_SUMMARY = RaceSummary(
    id="00000000-0000-0000-0000-000000000001",
    slug="stadsloop-mechelen-2026",
    race_type="weg",
    title={"nl": "Stadsloop Mechelen"},
    date=date(2026, 9, 1),
    distances=[{"label": "10 km", "km": 10}],
    city="Mechelen",
    province="antwerpen",
)

_DETAIL = RaceDetail(
    id="00000000-0000-0000-0000-000000000001",
    slug="stadsloop-mechelen-2026",
    race_type="weg",
    title={"nl": "Stadsloop Mechelen"},
    date=date(2026, 9, 1),
    distances=[{"label": "10 km", "km": 10, "price_eur": "12.50"}],
    location=Location(city="Mechelen", province="antwerpen"),
    status="live",
    organizer=PublicOrganizer(
        id="00000000-0000-0000-0000-0000000000aa",
        name="AC Mechelen",
        type="atletiekclub",
        website="https://example.test",
    ),
    created_at=datetime(2026, 6, 2, 12, 0, tzinfo=UTC),
    updated_at=datetime(2026, 6, 2, 12, 0, tzinfo=UTC),
)


class _FakeRepo:
    async def upcoming(self, months: int = 6) -> list[RaceSummary]:
        return [_SUMMARY]

    async def list_races(self, **_: object) -> tuple[list[RaceSummary], int]:
        return [_SUMMARY], 1

    async def get(self, slug: str) -> RaceDetail | None:
        return _DETAIL if slug == _DETAIL.slug else None

    async def related(self, slug: str, limit: int = 4) -> list[RaceSummary]:
        return [_SUMMARY]


def _client() -> httpx.AsyncClient:
    app = FastAPI()
    app.include_router(races_router, prefix="/api")
    app.dependency_overrides[get_race_repo] = _FakeRepo
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")


async def test_upcoming_returns_summaries() -> None:
    async with _client() as c:
        r = await c.get("/api/races/upcoming")
    assert r.status_code == 200
    body = r.json()
    assert body[0]["slug"] == "stadsloop-mechelen-2026"


async def test_list_has_pagination_shape() -> None:
    async with _client() as c:
        r = await c.get("/api/races?province=antwerpen&distance=10")
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 1
    assert body["limit"] == 50
    assert body["offset"] == 0
    assert len(body["races"]) == 1


async def test_detail_found_omits_contact_email() -> None:
    async with _client() as c:
        r = await c.get("/api/races/stadsloop-mechelen-2026")
    assert r.status_code == 200
    body = r.json()
    assert body["slug"] == "stadsloop-mechelen-2026"
    # The public organizer must never leak the contact email.
    assert "contact_email" not in body["organizer"]


async def test_detail_unknown_slug_404() -> None:
    async with _client() as c:
        r = await c.get("/api/races/does-not-exist")
    assert r.status_code == 404
