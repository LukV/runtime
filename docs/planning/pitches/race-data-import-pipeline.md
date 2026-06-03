---
project: runtime
type: pitch
status: in-cycle
area: calendar
appetite: an evening
created: 2026-06-02
started: 2026-06-03
---
# Race data import pipeline

## Problem

The endpoints work but the table is empty, and the calendar index page ([[../blocks/03-race-calendar]]) can't ship against nothing. We need a way to get real races *in* — and because Runtime is built in the open ([[shipped/hoe-het-werkt-over-ons-privacy]] → /meebouwen invites exactly this kind of help), the way we get data in should let a student or volunteer contribute without handing them database credentials. Hand-entering multilingual, JSONB-distance, enum-typed rows in the Supabase Dashboard is miserable and error-prone; a service key in a contributor's hands is a security hole. We want a path where anyone can fill a structured sheet, Luk reviews, and a script loads it safely and repeatably.

## Appetite

**An evening.** The template, the importer, a dry-run mode, and a small committed sample CSV proving it end-to-end. The *bulk* of curating ~25 races to launch is the separate ongoing curation slot, not this pitch — this builds the machine, not the 100 rows.

## Sketch

A small schema refinement first, then one CSV format, one idempotent importer, and a review-then-import workflow.

### Schema refinements (do these first)

Real June data (relays, loops, multi-day events, tiered/per-team prices, all-Belgium geography) showed the shipped model loses information. Six minimal changes — one new migration + the Pydantic models — before the importer is built against them:

1. **Province enum → 11 values.** Add the 5 Walloon provinces (`waals-brabant`, `henegouwen`, `luik`, `luxemburg`, `namen`) + `brussel`. Belgium-wide is the confirmed scope. Safe `alter type … add value if not exists` (zero race rows). The Vlaanderen/Wallonië/Brussel *region* shown in the design is derived from province, not a stored column.
2. **`end_date date` (nullable).** For genuinely multi-day events (e.g. "No Finish Line", 5 continuous days). The "over 4 dagen" countdown in the design is derived from `date`, not this.
3. **`price_info text` (nullable).** The human truth — "vroegboek €11–24, +€3 op wedstrijddag, ploeg van 3". Numeric `price_eur` stays as an optional *"vanaf"* entry price for sort/filter only; we do **not** model price tiers.
4. **`Distance.km` → optional.** `label` becomes authoritative for display ("9 km estafette", "4,6 km-lus ×1–3"); `km` stays where a real distance filter applies. JSONB, so no migration — Pydantic + parser only.
5. **`edition int` (nullable).** The "45E EDITIE" badge in the design.
6. **`tags text[]` (default `{}`).** Free-form, multi-valued facets — the row's profile/surface descriptor ("vlak", "bos", "stad") *and* any editorial theme ("kindvriendelijk", "goede doel"). Lower-cased and de-duplicated on import; new tags are data, not a migration.
7. **`homepage text` + `location_label text` (both nullable).** The event's own page (distinct from `registration_url`), and a venue name on the location ("Sporthal 't Rosco"). Surfaced by real organiser pages.
8. **`Distance.date` (optional).** The day a distance runs; null = the race's main `date`. Needed when a multi-day event splits distances across days (walk Saturday / run Sunday). JSONB, so Pydantic + parser only. The importer's `@` accepts an ISO datetime for these, and a `km=Label` form sets `km` when the label doesn't start with the distance.

### The CSV (schema-shaped, student-fillable)

Columns map to the refined `races` schema, flat and human-writable:

```
slug, race_type, title_nl, description_nl, date, end_date, start_time,
distances, price_eur, price_info, homepage, registration_url, image_url, edition, tags,
organizer_name, location_label, country, province, city, postal_code, street, house_nr, lat, lng, status
```

- **`distances`** uses a compact mini-syntax the importer parses — `km[@HH:MM][#price]`, multiple separated by `;`. E.g. `10@10:00#12.50;5@09:30`. Label auto-derives to `"10 km"` when only a number is given; an explicit label form (e.g. `9 km estafette@18:30`) overrides for relays/loops. Blank/non-numeric `km` is allowed (the label carries it). The exact separators are the importer's to own; documented in the template README.
- **Multilingual:** `title_nl`/`description_nl` for the Dutch-only pilot; the importer builds `{"nl": ...}`. Extra `title_fr`/etc. columns are picked up if present, so French is data later, not a code change.
- **`organizer_name`** is the denormalized field for now; linking to `organizers` rows is deferred (block 8 owns the organizer entity). `created_by`/`updated_by` stay null on import.

### The importer (`apps/api`, reuses what exists)

A script (`uv run python -m app.scripts.import_races <file.csv>`) that:

- Parses each row and **validates it through the Pydantic `Race` model** — so the schema is the single source of truth, no second definition.
- Collects **per-row diagnostics via `Result[T]`** (`app.core`) — "row 7: missing date", "row 12: bad province 'oost vlaanderen'" — and reports a summary instead of dying on the first bad row.
- **Upserts by `slug`** (`insert … on conflict (slug) do update`) over asyncpg, so re-running is safe and idempotent.
- **`--dry-run`** validates and reports without writing — the mode a contributor's PR runs, and the mode Luk runs before a real import.

It reads `DATABASE_URL` from the existing settings, so it points at the local stack or (with the pooler string in the env) the cloud project.

### The workflow (build-in-public)

The seed CSV lives in the repo (public). A contributor fills a copy — a shared Google Sheet exported to CSV, or a direct PR. `--dry-run` gives them validation feedback. Luk reviews, merges, and runs the real import. Luk stays the gatekeeper; no contributor ever touches a credential.

## Out of scope

- **The authenticated submission portal** (signup, org role, moderation queue) — that's [[../blocks/08-organizer-submissions]], and pulling it forward before the calendar is live is the wrong order.
- **Organizer entity linking.** Denormalized `organizer_name` only; `organizers` rows come with block 8.
- **Scraping / Claude-drafting a record from a URL.** A nice future accelerant, not now.
- **Curating the full 25–100 races.** That's the ongoing curation slot; this pitch ships the tool + a handful of real rows to prove it.
- **The index page itself** — the next slot, unblocked by this one.

## Risks / unknowns

- **`distances` mini-syntax parsing.** The compact format needs a test with multi-distance + missing start/price. Watch the numeric/time casts; bad input must produce a row diagnostic, not a crash.
- **CSV hygiene.** Commas in titles, UTF-8, empty optionals → use proper CSV quoting (or TSV) and treat blank as null. A test fixture with awkward rows.
- **Slugs.** Require an explicit `slug` in the CSV (validated URL-safe + unique within the file); don't auto-generate silently, or two races collide.
- **Running against cloud.** Needs `DATABASE_URL` with the pooler string + password in the operator's env (never committed). `--dry-run` first is the habit; document it.
- **Migration ordering.** The schema refinements ship as one new migration applied to local *and* cloud before any import. `alter type … add value` is non-transactional-friendly only when the new value is used in the same transaction — we don't, so it's safe; verify on `supabase db reset` first.

## Related

- Block: [[../blocks/03-race-calendar]] (the "Race data curation" slot — this is its mechanism)
- Builds on: [[shipped/race-data-model]] (schema + models), [[shipped/fastapi-race-endpoints]] (the models it validates against)
- In the open: [[shipped/hoe-het-werkt-over-ons-privacy]] (/meebouwen invites contributors)
- Defers to: [[../blocks/08-organizer-submissions]] (the authenticated portal)

---

## What actually happened

*(Fill in when the pitch ships or is dropped.)*
