---
project: runtime
type: pitch
status: in-cycle
area: calendar
appetite: a weekend
created: 2026-06-02
started: 2026-06-02
---
# FastAPI race endpoints

## Problem

The schema and models exist ([[shipped/race-data-model]]) but nothing serves them. The calendar pages — the index, the per-race SEO pages, the province/distance pages ([[../blocks/03-race-calendar]]) — are built statically by Next.js reading from FastAPI at build time. Until those endpoints exist, there's no calendar. This pitch is the **public read API** over the race data: the four endpoints the pages consume, returning the right shape for each job (lightweight rows for lists, full detail for the SEO page), and it settles the distance-filtering question the schema pitch deliberately punted.

## Appetite

**A weekend.** Four read endpoints, two response shapes, a thin testable data-access layer, and the distance-filter decision made. Cut line if it overflows: ship `/upcoming` + `/{slug}` (the index and the money page depend on those); `/races` list-with-filters and `/related` can follow in an evening.

## Sketch

### The endpoints (all public, no auth — reads only)

- `GET /api/races/upcoming` — next ~6 months, `status = 'live'`, sorted by date. The default calendar view; the index page's data source.
- `GET /api/races` — paginated list (`limit`/`offset`, returns `total`), filterable by `province`, `distance` (km), `month` (`YYYY-MM`), `race_type`. Backs the province/distance index pages and any filtered view.
- `GET /api/races/{slug}` — full detail for one race, `status in ('live', 'edition_past')` (past editions stay reachable for SEO; drafts 404). Embeds the public organizer fields. The SEO money page.
- `GET /api/races/related/{slug}` — 3–4 similar live races (same headline distance, same/nearby province), for the detail page's *"vergelijkbare wedstrijden"* block and internal linking.

OpenAPI auto-documents all of them (FastAPI default).

### Two response shapes

- **`RaceSummary`** (list/upcoming/related) — `slug`, `race_type`, `title`, `date`, `start_time`, headline distance(s), `city`, `province`, `image_url`. Small, no joins.
- **`RaceDetail`** (the `{slug}` route) — the full `Race` plus an embedded **`PublicOrganizer`** (`name`, `type`, `website` — **never `contact_email`**). Carries everything the page needs for Schema.org `SportsEvent` markup (date, location, organizer, offers/price).

These extend the models from [[shipped/race-data-model]]; the detail route assembles the nested `Location` and joins the organizer once.

### The query layer enforces `status` — RLS does not

FastAPI connects as the `postgres` role, which **bypasses RLS**. So the public endpoints are themselves responsible for never returning drafts: every query carries an explicit `where status = 'live'` (or `in ('live','edition_past')` for detail). RLS remains the backstop for the *anon PostgREST* surface; it is not what protects these endpoints. This is the load-bearing correctness rule of the pitch.

### Distance filtering: query-time over JSONB (the punted decision)

Resolve it the simple way: filter at query time against the `distances` JSONB (`exists (select from jsonb_array_elements(distances) d where (d->>'km')::numeric = :km)`). The table is small (hundreds of rows), so no index is needed and no migration is added. **Escape hatch if it ever bites:** a GIN-indexed `numeric[]` companion column — but not now.

### Data access, testable without a database

A thin data-access module (functions taking the asyncpg pool) behind an injectable dependency, so route tests **override it with canned `RaceSummary`/`RaceDetail` objects** — `api-ci` runs no database. One surface test per route (200 happy path; 404 for an unknown/draft slug on `{slug}`), per the testing conventions.

## Out of scope

- **Write endpoints and the auth gate.** Still no writes through FastAPI; the JWT/role gate waits for block 6/8. Curation stays in the Supabase Dashboard.
- **The Next.js pages themselves**, and ISR/`revalidatePath` cache invalidation — that's the page-build slots' concern and only matters once writes exist.
- **Seeding the 100 races** — the curation slot. These endpoints must return cleanly on an empty/near-empty table.
- **Schema.org markup** — page-side; the endpoint just returns the fields it needs.
- **Cursor pagination, full-text search, geo-radius queries.** Offset pagination is enough for a calendar.

## Risks / unknowns

- **`status` filtering is manual.** Because the API bypasses RLS, a forgotten `where status` leaks drafts. Mitigation: centralize it in the data-access layer, and a test that a `draft` slug 404s.
- **Distance-over-JSONB correctness.** The `jsonb_array_elements` predicate needs a test with a multi-distance race. Watch the numeric cast.
- **Empty calendar.** During early curation there may be zero live races; `/upcoming` and the index must render "nog geen wedstrijden" gracefully, not error.
- **List vs. detail N+1.** Lists use the denormalized `organizer_name` (no join); only detail joins the organizer. Keep it that way.

## Related

- Block: [[../blocks/03-race-calendar]] (the "FastAPI race endpoints" slot)
- Builds on: [[shipped/race-data-model]] (schema + models + RLS)
- Architecture: [[../../architecture/001-stack-decisions]] (FastAPI-only API surface, public reads)
- Downstream: the calendar index, race detail, and province/distance pages (later block-3 slots) consume these.

---

## What actually happened

*(Fill in when the pitch ships or is dropped.)*
