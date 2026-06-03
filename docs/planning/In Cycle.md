---
project: runtime
type: planning-current-cycle
status: active
updated: 2026-06-01
---
# In Cycle

What's being built right now. Usually one pitch at a time. If more than one is in flight, name them — but keep the list short. Discipline of one is easier than discipline of three.

When a pitch ships, move it to `pitches/shipped/` and update [[Released]] if the release boundary has been crossed.

---

## Currently in cycle

### [[pitches/race-data-import-pipeline]] — appetite: an evening

Started 2026-06-03.

The endpoints work but the `races` table is empty, and the calendar index page can't ship against nothing. This builds the machine to get real races *in*, build-in-public: a small schema refinement (province enum → 11, `end_date`, `price_info`, optional `Distance.km`, `edition`, free-form `tags`) shaken out by real June data, then a schema-shaped CSV and an idempotent, `--dry-run`-capable importer that validates each row through the Pydantic `Race` model and upserts by `slug`. Luk stays the gatekeeper; no contributor touches a credential. **Done** = the migration applied local+cloud, the importer + a small committed sample CSV proving it end-to-end, all gates green.

**Cap reached on:** *2026-06-04 (Thu, end of day)*

**Block 2: complete — 9 of 9 slots shipped (2026-06-01).** Monorepo scaffold (2026-05-27), Vercel + domain/DNS/mail-auth (2026-05-31), CI (2026-05-31), Nav + footer (2026-05-31), Page chrome / SEO + metadata (2026-06-01), Hoe het werkt + Over ons + Meebouwen + Privacy (2026-06-01), Plausible analytics (2026-06-01), Sentry error monitoring (2026-06-01). The website foundation is done — next is [[blocks/03-race-calendar]], the traffic engine.

## On deck

Block 2 is closed. Next block is [[blocks/03-race-calendar]] — the traffic engine, and the biggest non-app block in the plan. First pickup:

### Block 3 — race calendar

The schema slot shipped ([[pitches/shipped/race-data-model]]); the race endpoints are now in cycle ([[pitches/fastapi-race-endpoints]]). Next after them, in rough order:

1. **The calendar index page** — *a weekend*. `runtime.training/` as the calendar, reading `/api/races/upcoming` at build time.
2. **The race detail page** — *a week of evenings*. The SEO money page (`/wedstrijd/{slug}`). Needs its own design session first.
3. **Province + distance index pages** — *a weekend*. Scoped calendar views with editorial intros.
4. **Race data curation** — *ongoing*. Get 25 races up, then launch.

The slot framings in [[blocks/03-race-calendar]] carry the detail; write a pitch note when the shape isn't obvious (the detail page qualifies).

### Optional follow-ups (no pitch yet)

- **DKIM regenerate at 2048-bit + ratchet DMARC to `p=quarantine`** — *15 min*. Future evening when aggregate reports have been observed for ~2 weeks.
- **Supabase project + `migrations.yml` workflow** — separate pitch when the first migration exists (probably block 4 or 6).
- **Resend setup + transactional email DKIM selector** — separate pitch when the first transactional sender exists (likely block 4 intake confirmations).
