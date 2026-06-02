---
project: runtime
type: pitch
status: in-cycle
area: calendar
appetite: a weekend
created: 2026-06-02
started: 2026-06-02
---
# Race data model + schema foundation

## Problem

The calendar is the traffic engine ([[../blocks/03-race-calendar]]), and everything it does — the index page, the per-race SEO pages, the province/distance pages, the eventual organizer portal — reads from a `races` table that doesn't exist yet. Before any page or endpoint can be built, the data has to have a shape: what a race *is*, who organises it, where it happens, and in which languages it's told. We also can't open a database to the internet without deciding, up front, what's publicly readable and what's locked. This pitch lays that foundation: the Postgres schema, the Pydantic models, the security boundary, and a model that's ready for auth without building all of auth today.

This **supersedes** the original block-3 slot *"Schema for `races`, `organizers`, `race_submissions`"*. Three things changed since that was framed:

- **No `race_submissions` table.** We track *goals*, not submissions — and for now a goal is just a Plausible CTA event ([[shipped/page-chrome-seo-metadata]] era analytics), so there's nothing to model here. Organizer-submitted races come back as a table in [[../blocks/08-organizer-submissions]], not now.
- **The model is multilingual.** The old framing said "Dutch-only schema, multi-language out of scope." That's reversed: the *data* is i18n-ready from day one (the pilot UI stays Dutch-only — that decision in [[../../product-design/003-pilot-scope]] is untouched).
- **Organizer is a role, not just a table.** `admin`, `coach`, and `organizer` are roles a user holds. The organising *entity* (a club, a municipality) is separate data that a race points at and that an organizer-role user can later own.

## Appetite

**A weekend.** The schema, the models, the RLS policies, the first migration, and Luk bootstrapped as admin. If it overflows, the cut line is clean: ship the `races` + `organizers` tables + RLS + models, and let the `profiles`/roles plumbing slip to its own evening — the race data is the thing the calendar actually blocks on.

## Sketch

Four pieces: the security stance, the schema, the i18n shape, and the auth we *foresee* without building.

### Security is RLS, not a FastAPI gate

Supabase exposes a PostgREST API on the public anon key [1], so the real boundary is **Row-Level Security**, enforced at the database. That's the minimum needed to have no hole — independent of what FastAPI does:

- **Public read, narrow:** anon can `SELECT` from `races`/`organizers` only where `status = 'live'`. Drafts and past-edition rows aren't world-readable until intended.
- **No public writes:** no anon `INSERT`/`UPDATE`/`DELETE` anywhere. Writes happen via the **service-role key (server-side only)** or, later, an authenticated admin.
- **`profiles` is self-read only:** a signed-in user can read their own profile row; nobody reads the whole table from the client.

For the pilot, curation is Luk in the **Supabase Dashboard** (per the block-3 curation slot), and FastAPI's race endpoints (next slot) are **read-only and public**. So there is nothing yet that needs a JWT gate — and shipping no unauthenticated write endpoints is itself the simplest secure choice.

[1] the **anon key** (anonymous key) is a public API key that client applications (web apps, mobile apps, etc.) use to access Supabase services.
### The schema (first migration, `supabase/migrations/`)

```
enums
  race_type      : weg | trail | cross          -- extensible
  province       : antwerpen | oost-vlaanderen | west-vlaanderen | limburg | vlaams-brabant
  race_status    : draft | live | edition_past
  organizer_type : atletiekclub | commercial | municipality | informal
  user_role      : admin | coach | organizer

profiles                              -- foresee auth: 1:1 with auth.users
  id          uuid pk  -> auth.users(id) on delete cascade
  role        user_role not null default 'organizer'
  display_name text
  created_at, updated_at

organizers                            -- the organising entity (not the role)
  id           uuid pk default gen_random_uuid()
  name         text not null          -- proper noun; not translated
  type         organizer_type not null default 'informal'
  website      text
  contact_email text
  owner_id     uuid -> profiles(id)   -- nullable; the organizer-role user who manages it,
                                       -- null for hand-curated entities
  created_at, updated_at, created_by, updated_by  -> auth.users

races
  id            uuid pk default gen_random_uuid()
  slug          text unique not null
  race_type     race_type not null
  title         jsonb not null         -- multilingual: {"nl": "...", "fr": "..."}
  description   jsonb                   -- multilingual, nullable
  date          date not null
  start_time    time                    -- default/headline start; per-distance times live in `distances`
  distances     jsonb not null default '[]'   -- [{label, km, start_time?, price_eur?}]
  price_eur     numeric                 -- optional base price (per-distance prices in `distances`)
  registration_url text                 -- the official inschrijving URL
  image_url     text
  organizer_id  uuid -> organizers(id)  -- nullable
  organizer_name text                   -- denormalized for hand-entered races without an org row
  -- location: country + city required, the rest optional
  country       text not null default 'BE'
  province      province                -- nullable; drives the /antwerpen-style index pages
  city          text not null
  postal_code   text
  street        text
  house_nr      text
  lat           numeric
  lng           numeric
  status        race_status not null default 'draft'
  created_at, updated_at, created_by, updated_by  -> auth.users
```

Indexes on `slug` (unique), `date`, `province`, `race_type`. Distance-based filtering (the `/10km` pages) reads from `distances` — the exact filter mechanism (a GIN-indexed companion array vs. query-time) is a small call for the endpoints slot, not this one.

`created_by`/`updated_by` reference `auth.users` even though, in the pilot, most rows are hand-entered and may carry Luk's id or null. The columns exist now so we never migrate audit history in later.

### i18n: JSONB keyed by locale

Translatable fields (`title`, `description`) are JSONB maps `{"nl": "…"}`. The pilot writes `nl` only. A `Translated` Pydantic type wraps it with a `nl` fallback so reads never blow up on a missing locale. **Adding French later is data, not a migration** — write the `fr` key, done. No translations table, no per-language columns.

### Pydantic models (`apps/api/app/models/`)

Mirror the rows: a `common.py` with the `Locale` literal, the `Translated` type + a `localized(value, locale)` helper, and the StrEnums; `race.py` (`Race`, `Distance`, `Location`); `organizer.py` (`Organizer`); `profile.py` (`Profile`, `UserRole`). These are the shapes the read endpoints (next slot) return — no DB access in this pitch beyond the migration.

### Auth, foreseen — not built

Mechanism is already decided ([[../../architecture/001-stack-decisions]]): web roles use **Supabase Auth → JWT verified in FastAPI**; runners use device tokens (block 6); reads are public. This pitch does only the foreseeing part: **enable Supabase Auth, create the `profiles`/`user_role` model, bootstrap Luk's admin profile.** The JWT-verification + role-gate dependency is deferred to the first pitch that adds a FastAPI *write* endpoint (block 6 coach console, or block 8 organizer portal) — that's the documented trigger.

## Out of scope

- **The FastAPI JWT/role-gate code.** No write endpoints yet → nothing to gate. Lands with the first write endpoint.
- **`race_submissions` / organizer self-submission.** Block 8.
- **A `goals` table.** Goals are Plausible CTA events for now; no model.
- **Race query endpoints** (`GET /api/races…`). The next block-3 slot.
- **Device-token runner auth.** Block 6.
- **Past-edition cross-linking** ("this race in 2024/2025"). The `edition_past` status keeps pages live; linking comes later.
- **A curation admin UI.** Luk uses the Supabase Dashboard for the pilot.

## Risks / unknowns

- **RLS correctness is the whole security story.** A loose policy is the actual hole. Mitigation: deny-by-default, then add the narrow public-read policy; test with the anon key that a `draft` race is invisible and that no write succeeds.
- **Distance filtering vs. JSONB.** Storing distances as JSONB is right for display but awkward for `/10km`-style filtering. Punted to the endpoints slot on purpose — flag it so it isn't a surprise there.
- **First migration stands up the migration toolchain.** This is the first real `supabase/migrations/` entry, so it also settles the local `supabase db reset` / production `supabase db push` loop. The `migrations.yml` manual workflow (the deferred follow-up in [[../In Cycle]]) may ride along or follow immediately.
- **`profiles` ↔ `auth.users` trigger.** Supabase's standard pattern is a trigger that inserts a `profiles` row on signup. For the pilot (one admin, created by hand) we may skip the trigger and insert Luk's row directly — note it so it's a deliberate omission, not a gap.

## Related

- Block: [[../blocks/03-race-calendar]] (supersedes its "Schema" slot)
- Architecture: [[../../architecture/001-stack-decisions]] (FastAPI-only API surface, Supabase Auth for web roles, device tokens for runners, RLS)
- Product: [[../../product-design/003-pilot-scope]] (Dutch-only *UI*; the data is i18n-ready), [[../../product-design/004-design-system-and-screens]]
- Downstream: [[../blocks/06-coach-backend-woz]] (JWT/role gate), [[../blocks/08-organizer-submissions]] (organizer role + submissions)

---

## What actually happened

*(Fill in when the pitch ships or is dropped.)*
