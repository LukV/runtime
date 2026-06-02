"""Public race endpoints — read-only, no auth.

Route order matters: the literal `/upcoming` and `/related/{slug}` are declared
before `/{slug}` so they aren't swallowed by the slug param.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.dependencies import RaceRepoDep
from app.models import Province, RaceDetail, RaceSummary, RaceType

router = APIRouter(prefix="/races", tags=["races"])


class RaceListResponse(BaseModel):
    races: list[RaceSummary]
    total: int
    limit: int
    offset: int


@router.get("/upcoming")
async def upcoming(repo: RaceRepoDep, months: int = Query(6, ge=1, le=24)) -> list[RaceSummary]:
    """Live races in roughly the next `months` months, sorted by date."""
    return await repo.upcoming(months)


@router.get("")
async def list_races(
    repo: RaceRepoDep,
    province: Province | None = None,
    race_type: RaceType | None = None,
    distance: float | None = Query(None, gt=0, description="Distance in km a race must offer"),
    month: str | None = Query(None, pattern=r"^\d{4}-\d{2}$", description="YYYY-MM"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> RaceListResponse:
    """Paginated, filterable list of live races."""
    races, total = await repo.list_races(
        province=province,
        race_type=race_type,
        distance=distance,
        month=month,
        limit=limit,
        offset=offset,
    )
    return RaceListResponse(races=races, total=total, limit=limit, offset=offset)


@router.get("/related/{slug}")
async def related(slug: str, repo: RaceRepoDep) -> list[RaceSummary]:
    """A few similar live races (same/nearby province or shared distance)."""
    return await repo.related(slug)


@router.get("/{slug}")
async def get_race(slug: str, repo: RaceRepoDep) -> RaceDetail:
    """Full detail for one race. Live and past editions resolve; drafts 404."""
    race = await repo.get(slug)
    if race is None:
        raise HTTPException(status_code=404, detail="Race not found")
    return race
