"""Import races from a schema-shaped CSV into the `races` table.

Usage:
    uv run python -m app.scripts.import_races <file.csv> [--dry-run]

Each row is parsed and validated through the same Pydantic types the API uses
(`RaceImport`, reusing `Distance`/`Location` and the enums), so the schema stays
the single source of truth. Per-row problems become `Result` diagnostics and the
row is skipped — one bad row never aborts the rest. Valid rows are upserted by
`slug`, so re-running after a fix is safe and idempotent.

`DATABASE_URL` comes from the environment / `.env` (the Session-pooler string for
cloud). `--dry-run` validates and reports without writing — the mode a
contributor runs on their PR, and the habit to run before every real import.

The `distances` column uses a compact mini-syntax, segments separated by `;`:

    km[@when][#price]              e.g.  10@10:00#12.50;5@09:30
    <label>[@when][#price]        e.g.  9 km estafette@18:30;4,6 km-lus ×1-3
    km=<label>[@when][#price]     e.g.  17.5=Walk - 17,5 km@2026-06-27T08:30

A pure number becomes a canonical "N km" label; anything else is kept verbatim
as the label, with a leading number (if any) lifted into `km`. Use the `km=Label`
form when the label doesn't start with the distance. `when` is a bare time
(`08:30`) or, for multi-day events where distances fall on different days, an ISO
datetime (`2026-06-27T08:30`). Decimals may use a comma or a dot.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import json
import re
import sys
from collections.abc import Mapping
from decimal import Decimal
from pathlib import Path
from typing import Any

import asyncpg
from pydantic import ValidationError

from app.config import get_settings
from app.core import Result
from app.models import Distance, RaceImport

_LEADING_NUM = re.compile(r"^\s*(\d+(?:[.,]\d+)?)")
_ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

# Insert column order; jsonb/enum columns carry an explicit cast so we can pass
# plain text/JSON params without depending on a connection codec.
_COLUMNS = [
    "slug", "race_type", "title", "description", "date", "end_date", "start_time",
    "distances", "price_eur", "price_info", "edition", "tags",
    "homepage", "registration_url", "image_url", "organizer_name",
    "location_label", "country", "province", "city", "postal_code", "street", "house_nr", "lat", "lng",
    "status",
]  # fmt: skip
_CASTS = {
    "title": "::jsonb",
    "description": "::jsonb",
    "distances": "::jsonb",
    "race_type": "::race_type",
    "province": "::province",
    "status": "::race_status",
}


def _upsert_sql() -> str:
    placeholders = ", ".join(f"${i + 1}{_CASTS.get(col, '')}" for i, col in enumerate(_COLUMNS))
    updates = ", ".join(f"{col} = excluded.{col}" for col in _COLUMNS if col != "slug")
    return (
        f"insert into races ({', '.join(_COLUMNS)}) values ({placeholders}) on conflict (slug) do update set {updates}"
    )


def _nz(value: str | None) -> str | None:
    """Strip; treat blank as absent."""
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _decimal(raw: str) -> Decimal:
    return Decimal(raw.strip().replace(",", "."))


def _tags(raw: str | None) -> list[str]:
    """Split a `;`-separated tag cell into normalized (stripped, lower-cased,
    de-duplicated) facets. Lower-casing keeps 'Bos' and 'bos' one facet."""
    if not raw:
        return []
    out: list[str] = []
    for part in raw.split(";"):
        tag = part.strip().lower()
        if tag and tag not in out:
            out.append(tag)
    return out


def _translated(row: Mapping[str, str | None], prefix: str) -> dict[str, str]:
    """Collect `<prefix><locale>` columns into a locale-keyed map (e.g. title_nl,
    title_fr -> {"nl": ..., "fr": ...}). Adding a language is a new column."""
    out: dict[str, str] = {}
    for key, value in row.items():
        if not key or not key.startswith(prefix):
            continue
        locale = key[len(prefix) :].strip()
        text = _nz(value)
        if locale and text:
            out[locale] = text
    return out


def _split_when(value: str) -> tuple[str | None, str | None]:
    """Split a `@` value into (date, time). Accepts a bare time (`08:30`), an ISO
    datetime (`2026-06-27T08:30:00`, for multi-day per-distance starts), or a bare
    date. Pydantic parses the parts."""
    if "T" in value:
        day, _, clock = value.partition("T")
        return (day or None, clock or None)
    if _ISO_DATE.match(value):
        return (value, None)
    return (None, value)


def _parse_distances(raw: str | None, res: Result[RaceImport], line: int) -> list[Distance]:
    distances: list[Distance] = []
    if not raw or not raw.strip():
        return distances
    for segment in raw.split(";"):
        seg = segment.strip()
        if not seg:
            continue
        price: Decimal | None = None
        if "#" in seg:
            seg, _, price_raw = seg.rpartition("#")
            try:
                price = _decimal(price_raw)
            except ArithmeticError:  # includes decimal.InvalidOperation
                res.error("distance_price", f"row {line}: bad price '{price_raw}' in distance")
        day: str | None = None
        start: str | None = None
        if "@" in seg:
            seg, _, at_raw = seg.rpartition("@")
            if at_raw.strip():
                day, start = _split_when(at_raw.strip())
        core = seg.strip()
        km: float | None = None
        if "=" in core:
            # explicit `km=Label`, for labels that don't lead with the distance
            # (e.g. "17.5=Walk - 17,5 km").
            km_raw, _, label = core.partition("=")
            label = label.strip()
            try:
                km = float(km_raw.strip().replace(",", "."))
            except ValueError:
                res.error("distance", f"row {line}: bad km '{km_raw.strip()}' in distance")
        else:
            match = _LEADING_NUM.match(core)
            if core and match and match.group(0).strip() == core:
                km = float(match.group(1).replace(",", "."))
                label = f"{km:g} km"
            else:
                label = core
                if match:
                    km = float(match.group(1).replace(",", "."))
        if not label:
            res.error("distance", f"row {line}: empty distance segment")
            continue
        try:
            distances.append(Distance(label=label, km=km, date=day, start_time=start, price_eur=price))
        except ValidationError as exc:
            res.error("distance", f"row {line}: invalid distance '{segment.strip()}': {_first_error(exc)}")
    return distances


def _first_error(exc: ValidationError) -> str:
    err = exc.errors()[0]
    loc = ".".join(str(part) for part in err["loc"])
    return f"{loc}: {err['msg']}" if loc else err["msg"]


def parse_row(row: Mapping[str, str | None], line: int) -> Result[RaceImport]:
    """Parse one CSV row into a validated `RaceImport`, or a Result carrying the
    reasons it couldn't. `line` is the 1-based file line (2 = first data row)."""
    res: Result[RaceImport] = Result()

    title = _translated(row, "title_")
    if not title:
        res.error("title", f"row {line}: missing title (need at least a title_nl column)")
    description = _translated(row, "description_") or None
    distances = _parse_distances(row.get("distances"), res, line)

    price_eur: Decimal | None = None
    price_raw = _nz(row.get("price_eur"))
    if price_raw:
        try:
            price_eur = _decimal(price_raw)
        except ArithmeticError:  # includes decimal.InvalidOperation
            res.error("price_eur", f"row {line}: bad price_eur '{price_raw}'")

    edition: int | None = None
    edition_raw = _nz(row.get("edition"))
    if edition_raw:
        try:
            edition = int(edition_raw)
        except ValueError:
            res.error("edition", f"row {line}: edition must be a whole number, got '{edition_raw}'")

    payload: dict[str, Any] = {
        "slug": _nz(row.get("slug")),
        "race_type": _nz(row.get("race_type")),
        "title": title,
        "description": description,
        "date": _nz(row.get("date")),
        "end_date": _nz(row.get("end_date")),
        "start_time": _nz(row.get("start_time")),
        "distances": distances,
        "price_eur": price_eur,
        "price_info": _nz(row.get("price_info")),
        "edition": edition,
        "tags": _tags(row.get("tags")),
        "homepage": _nz(row.get("homepage")),
        "registration_url": _nz(row.get("registration_url")),
        "image_url": _nz(row.get("image_url")),
        "organizer_name": _nz(row.get("organizer_name")),
        "location": {
            "label": _nz(row.get("location_label")),
            "country": _nz(row.get("country")) or "BE",
            "city": _nz(row.get("city")),
            "province": _nz(row.get("province")),
            "postal_code": _nz(row.get("postal_code")),
            "street": _nz(row.get("street")),
            "house_nr": _nz(row.get("house_nr")),
            "lat": _nz(row.get("lat")),
            "lng": _nz(row.get("lng")),
        },
        "status": _nz(row.get("status")) or "draft",
    }

    if res.has_errors:
        return res  # field-level parse errors already; don't pile on Pydantic noise
    try:
        res.data = RaceImport.model_validate(payload)
    except ValidationError as exc:
        for err in exc.errors():
            loc = ".".join(str(part) for part in err["loc"])
            res.error("validation", f"row {line}: {loc}: {err['msg']}")
    return res


def _row_args(race: RaceImport) -> list[Any]:
    values: dict[str, Any] = {
        "slug": race.slug,
        "race_type": race.race_type.value,
        "title": json.dumps(race.title),
        "description": json.dumps(race.description) if race.description else None,
        "date": race.date,
        "end_date": race.end_date,
        "start_time": race.start_time,
        "distances": json.dumps([d.model_dump(mode="json", exclude_none=True) for d in race.distances]),
        "price_eur": race.price_eur,
        "price_info": race.price_info,
        "edition": race.edition,
        "tags": race.tags,
        "homepage": race.homepage,
        "registration_url": race.registration_url,
        "image_url": race.image_url,
        "organizer_name": race.organizer_name,
        "location_label": race.location.label,
        "country": race.location.country,
        "province": race.location.province.value if race.location.province else None,
        "city": race.location.city,
        "postal_code": race.location.postal_code,
        "street": race.location.street,
        "house_nr": race.location.house_nr,
        "lat": race.location.lat,
        "lng": race.location.lng,
        "status": race.status.value,
    }
    return [values[col] for col in _COLUMNS]


async def _upsert(races: list[RaceImport], dsn: str) -> None:
    conn = await asyncpg.connect(dsn)
    try:
        await conn.executemany(_upsert_sql(), [_row_args(r) for r in races])
    finally:
        await conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Import races from a schema-shaped CSV.")
    parser.add_argument("csv_path", type=Path, help="Path to the races CSV.")
    parser.add_argument("--dry-run", action="store_true", help="Validate and report without writing.")
    ns = parser.parse_args(argv)

    if not ns.csv_path.exists():
        print(f"error: file not found: {ns.csv_path}", file=sys.stderr)
        return 2

    # utf-8-sig tolerates a BOM from spreadsheet exports.
    with ns.csv_path.open(newline="", encoding="utf-8-sig") as fh:
        rows = list(csv.DictReader(fh))

    results = [parse_row(row, line) for line, row in enumerate(rows, start=2)]
    valid = [r.data for r in results if r.data is not None]
    skipped = sum(1 for r in results if r.has_errors)

    for r in results:
        for diag in r.diagnostics:
            print(f"  [{diag.severity}] {diag.message}", file=sys.stderr)

    print(f"{len(rows)} row(s): {len(valid)} valid, {skipped} skipped")

    if ns.dry_run:
        print("dry-run: nothing written.")
        return 1 if skipped else 0

    if not valid:
        print("nothing to import.")
        return 1 if skipped else 0

    settings = get_settings()
    if not settings.database_url:
        print("error: DATABASE_URL is not set; cannot import.", file=sys.stderr)
        return 2

    asyncio.run(_upsert(valid, settings.database_url))
    print(f"upserted {len(valid)} race(s) by slug.")
    return 1 if skipped else 0


if __name__ == "__main__":
    raise SystemExit(main())
