"""Race data access.

A `RaceRepository` protocol with a Postgres implementation over the asyncpg
pool. Routes depend on the protocol so tests can substitute a fake — `api-ci`
runs no database.

Because FastAPI connects as the `postgres` role and **bypasses RLS**, every
public query here filters `status` itself. This is the load-bearing rule: a
forgotten `status` clause would leak drafts. It lives here, in one place.
"""

from __future__ import annotations

from typing import Protocol

import asyncpg

from app.models import (
    Location,
    Province,
    PublicOrganizer,
    RaceDetail,
    RaceSummary,
    RaceType,
)

# Columns for the lightweight summary shape.
_SUMMARY_COLS = "id, slug, race_type, title, date, start_time, distances, city, province, image_url"
_SUMMARY_COLS_R = ", ".join(f"r.{c}" for c in _SUMMARY_COLS.split(", "))

# Full detail: explicit race columns + the public organizer, joined once.
_DETAIL_SQL = """
    select
        r.id, r.slug, r.race_type, r.title, r.description, r.date, r.start_time,
        r.distances, r.price_eur, r.registration_url, r.image_url,
        r.organizer_id, r.organizer_name,
        r.country, r.province, r.city, r.postal_code, r.street, r.house_nr, r.lat, r.lng,
        r.status, r.created_at, r.updated_at, r.created_by, r.updated_by,
        o.id as org_id, o.name as org_name, o.type as org_type, o.website as org_website
    from races r
    left join organizers o on o.id = r.organizer_id
    where r.slug = $1 and r.status in ('live', 'edition_past')
"""


def _summary(row: asyncpg.Record) -> RaceSummary:
    return RaceSummary(
        id=row["id"],
        slug=row["slug"],
        race_type=row["race_type"],
        title=row["title"],
        date=row["date"],
        start_time=row["start_time"],
        distances=row["distances"],
        city=row["city"],
        province=row["province"],
        image_url=row["image_url"],
    )


def _detail(row: asyncpg.Record) -> RaceDetail:
    organizer = None
    if row["org_id"] is not None:
        organizer = PublicOrganizer(
            id=row["org_id"],
            name=row["org_name"],
            type=row["org_type"],
            website=row["org_website"],
        )
    location = Location(
        country=row["country"],
        city=row["city"],
        province=row["province"],
        postal_code=row["postal_code"],
        street=row["street"],
        house_nr=row["house_nr"],
        lat=row["lat"],
        lng=row["lng"],
    )
    return RaceDetail(
        id=row["id"],
        slug=row["slug"],
        race_type=row["race_type"],
        title=row["title"],
        description=row["description"],
        date=row["date"],
        start_time=row["start_time"],
        distances=row["distances"],
        price_eur=row["price_eur"],
        registration_url=row["registration_url"],
        image_url=row["image_url"],
        organizer_id=row["organizer_id"],
        organizer_name=row["organizer_name"],
        location=location,
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        created_by=row["created_by"],
        updated_by=row["updated_by"],
        organizer=organizer,
    )


class RaceRepository(Protocol):
    async def upcoming(self, months: int = 6) -> list[RaceSummary]: ...

    async def list_races(
        self,
        *,
        province: Province | None,
        race_type: RaceType | None,
        distance: float | None,
        month: str | None,
        limit: int,
        offset: int,
    ) -> tuple[list[RaceSummary], int]: ...

    async def get(self, slug: str) -> RaceDetail | None: ...

    async def related(self, slug: str, limit: int = 4) -> list[RaceSummary]: ...


class PostgresRaceRepository:
    """RaceRepository backed by the shared asyncpg pool."""

    def __init__(self, pool: asyncpg.Pool) -> None:
        self._pool = pool

    async def upcoming(self, months: int = 6) -> list[RaceSummary]:
        sql = f"""
            select {_SUMMARY_COLS} from races
            where status = 'live'
              and date >= current_date
              and date < current_date + ($1 || ' months')::interval
            order by date asc
        """
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(sql, str(months))
        return [_summary(r) for r in rows]

    async def list_races(
        self,
        *,
        province: Province | None,
        race_type: RaceType | None,
        distance: float | None,
        month: str | None,
        limit: int,
        offset: int,
    ) -> tuple[list[RaceSummary], int]:
        conds = ["status = 'live'"]
        args: list[object] = []
        if province is not None:
            args.append(province.value)
            conds.append(f"province = ${len(args)}::province")
        if race_type is not None:
            args.append(race_type.value)
            conds.append(f"race_type = ${len(args)}::race_type")
        if month is not None:
            args.append(month)
            conds.append(f"to_char(date, 'YYYY-MM') = ${len(args)}")
        if distance is not None:
            args.append(distance)
            conds.append(
                f"exists (select 1 from jsonb_array_elements(distances) d where (d->>'km')::numeric = ${len(args)})"
            )
        where = " and ".join(conds)
        list_sql = (
            f"select {_SUMMARY_COLS} from races where {where} "
            f"order by date asc limit ${len(args) + 1} offset ${len(args) + 2}"
        )
        count_sql = f"select count(*) from races where {where}"
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(list_sql, *args, limit, offset)
            total = await conn.fetchval(count_sql, *args)
        return [_summary(r) for r in rows], int(total)

    async def get(self, slug: str) -> RaceDetail | None:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(_DETAIL_SQL, slug)
        return _detail(row) if row is not None else None

    async def related(self, slug: str, limit: int = 4) -> list[RaceSummary]:
        sql = f"""
            with target as (select id, province, distances from races where slug = $1)
            select {_SUMMARY_COLS_R}
            from races r, target t
            where r.status = 'live' and r.id <> t.id and r.date >= current_date
              and (
                r.province is not distinct from t.province
                or exists (
                    select 1
                    from jsonb_array_elements(r.distances) rd, jsonb_array_elements(t.distances) td
                    where (rd->>'km')::numeric = (td->>'km')::numeric
                )
              )
            order by (r.province is not distinct from t.province) desc, r.date asc
            limit $2
        """
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(sql, slug, limit)
        return [_summary(r) for r in rows]
