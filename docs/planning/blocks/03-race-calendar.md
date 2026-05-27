---
project: runtime
type: planning-block
block: race-calendar
status: not-started
updated: 2026-05-26
---
# Block 3 — Race Calendar

The traffic engine. `runtime.training` **is** the calendar — that's the thesis from [[../../product-design/004-design-system-and-screens#4. The website]]. 100+ hand-curated Flemish races, six months out, each its own URL, each ranking for hyper-local queries. The page someone Googling *"stadsloop mechelen 2026"* lands on, and the page that funnels them to the app and the pilot.

This is the **biggest non-app block** in the plan and the one that earns the most traffic per evening of work. Two parallel tracks: design+build the page templates (small, finite), and curate the actual race data (the long pole, mostly data entry + writing).

The calendar has to *shine* per the two-month plan. Shine = real local data (organizer, edition, parcours notes, distance breakdown, registration link), clean visual treatment, fast load times, and genuinely useful filters. Aggregators don't have any of these — that's the moat.

Race data lives in **Supabase Postgres** from day one (per [[../../architecture/001-stack-decisions]]). Reads go through FastAPI ([[06-coach-backend-woz]] builds the API layer). The Next.js pages use `generateStaticParams` for per-race pages, ISR for incremental updates.

Design: [[../../product-design/004-design-system-and-screens#4. The website]] + [[../../product-design/004-design-system-and-screens#The screens]] (Wedstrijd sheet is the in-app cousin of the race page).

## Pitches

### Schema for `races`, `organizers`, `race_submissions` — *an evening*

Postgres tables. Approximately:

```
races
  id (uuid)
  slug (text, unique, URL-safe)
  name (text)
  edition_number (int, nullable)
  date (timestamp)
  start_time (time, nullable)
  distance_km (numeric, nullable for multi-distance events)
  distances (jsonb, for wave events: [{name, km, time}])
  terrain (enum: weg, cross, trail)
  city (text)
  province (enum: antwerpen, oost-vlaanderen, west-vlaanderen, limburg, vlaams-brabant)
  lat (numeric, nullable)
  lng (numeric, nullable)
  elevation_note (text, nullable)
  parcours (text)
  organizer_id (fk, nullable)
  organizer_name (text, denormalized for hand-entered races without organizer accounts)
  inschrijving_url (text)
  inschrijving_price_eur (numeric, nullable)
  editorial_notes (text)
  participant_count_last_year (int, nullable)
  status (enum: draft, live, edition-past)
  source (enum: hand-curated, organizer-submitted)
  created_at, updated_at, published_at

organizers
  id (uuid)
  name (text)
  type (enum: atletiekclub, commercial, municipality, informal)
  contact_email (text)
  auth_user_id (fk to auth.users, nullable for hand-entered organizers)
  verified (boolean, default false)
  created_at, updated_at

race_submissions
  id
  organizer_id (fk)
  race_id (fk, nullable until approved → race created)
  submitted_data (jsonb, the raw form submission)
  status (enum: pending, approved, changes-requested, rejected)
  reviewer_notes (text)
  submitted_at, reviewed_at
```

*Migrations.* Use Supabase CLI for migrations. Initial migration creates these three tables + indexes on `slug`, `date`, `province`, `distance_km`. RLS policies: races and organizers public-readable for `status = live`, write-restricted to admin role.

*Out of scope.* Past-editions historical archive (the `edition-past` status lets pages stay live, but cross-edition linking — *"this race in 2024, 2025"* — comes later). Multi-language schemas (Dutch-only for v1).

### FastAPI race endpoints — *a weekend*

The API layer from [[06-coach-backend-woz]] adds the calendar endpoints:

- `GET /api/races` — paginated list, filterable by `province`, `distance`, `month`, `terrain`. Returns lightweight rows for the calendar index.
- `GET /api/races/{slug}` — full race detail.
- `GET /api/races/upcoming` — next 6 months, sorted by date. The default calendar view.
- `GET /api/races/related/{slug}` — 3-4 similar races (same distance, nearby province). For the race detail page's "vergelijkbare wedstrijden" block.

OpenAPI auto-documented. Public endpoints — no auth required for read.

*Risk.* Cache invalidation. When a race is updated via the admin or organizer portal, the static Next.js pages need to know to revalidate. Use Next.js `revalidatePath` triggered by a webhook from the FastAPI write endpoints.

### The calendar index page — *a weekend*

`runtime.training/` — the landing-as-calendar. H1 *"100 wedstrijden in Vlaanderen. De volgende zes maanden."*, big-number stats block, filter band (distance + province), grouped-by-month race rows with the highlighted current-runner race treatment, the threaded mid-list CTA blocks (app nudge after the first few rows, pilot card later), waitlist band, Luk strip, footer. All laid out per the website SVG.

Reads from `GET /api/races/upcoming` at build time (SSG). Filter changes update the URL (`?province=antwerpen&distance=10`) and re-render via ISR.

*Out of scope.* User accounts, race favoriting, saved filters, anything that requires login.

### The race detail page — *a week of evenings*

`runtime.training/wedstrijd/{slug}` — one page per race. This is the **SEO money page** — the page Google sends people to. Has to do four jobs at once:

1. Be useful immediately (date, distance, terrain, parcours notes, organizer info, time-of-year context).
2. Build trust in Runtime as the curator (editorial notes, edition number, organizer history).
3. Deep-link to the official inschrijving (primary CTA in veldgroen).
4. Surface the app and the pilot as secondary and tertiary CTAs, *only if* the runner lingers.

Page also includes a "vergelijkbare wedstrijden" block (3-4 races) — both UX and internal-linking value for SEO. Plus the *"Is dit jouw wedstrijd?"* contributor footer from [[08-organizer-submissions]].

Generated statically at build, regenerated via ISR webhook on data change. Schema.org `SportsEvent` markup with all available fields (date, location, organizer, offers).

*Open question.* The page hasn't been designed. The in-app wedstrijd sheet ([[../../product-design/004-design-system-and-screens#Wedstrijd sheet]]) is a starting point but the website version needs to be a *standalone landing*, not a modal sheet. **Own design session before this pitch starts.**

### Province + distance index pages — *a weekend*

`runtime.training/antwerpen`, `runtime.training/oost-vlaanderen`, `runtime.training/west-vlaanderen`, `runtime.training/limburg`, `runtime.training/vlaams-brabant` plus `runtime.training/5km`, `runtime.training/10km`, `runtime.training/halve-marathon`, `runtime.training/marathon`.

Each is the calendar index, scoped. Plus a unique 2-3 paragraph intro per page (real editorial — *"De provincie Antwerpen heeft de dichtste hardloopkalender van Vlaanderen…"*) for SEO substance. Same template as the index, different data filter, different intro.

*Why this matters.* Generic queries like *"hardloopwedstrijden antwerpen"* and *"10 km lopen vlaanderen"* are higher volume than specific race names. These pages catch that traffic and funnel down to the specific race pages.

### Race data curation — *ongoing, ~3 weeks total of evenings*

The 100 races. This is mostly data entry but it's the *real* work — the moat. Each race needs:

- Name, slug, edition number, date, start time
- Distance(s), terrain, elevation note
- City, province, lat/long (optional for v1, useful for schema markup)
- Parcours description, 2-3 sentences
- Organizer name + history (years running, participant count)
- Official inschrijving URL + price
- Editorial notes (any quirks, things to know)

Source mix: existing race aggregators (running.be, joggings.be — for *names and dates only*, not copy), organizer websites directly (most of the editorial content), local atletiekclub sites, KAVVV calendars.

Curation tool: Luk uses Supabase Dashboard directly for v1 (no admin UI yet — comes in [[08-organizer-submissions]] as the moderation queue, which doubles as a hand-entry tool). Eventually a small Claude Code workflow that takes a race URL + organizer note and drafts the record for Luk to review.

*Sequencing.* Don't try to do all 100 before the calendar goes live. Get 25 races up — enough to look credible — and launch. Then add 5-10 per week from there.

### XML sitemap + robots — *an evening*

Auto-generated sitemap.xml listing the index, every race page, both province pages, every distance page, *Hoe het werkt*, *Over ons*, the pilot landing. Submit to Google Search Console + Bing Webmaster Tools. `robots.txt` allows everything by default.

Sitemap is generated at build by reading from FastAPI. Regenerated on every deploy.

### Featured listings as a future revenue lever — *deferred*

From [[../../product-design/001-product-vision]] — organizer-paid featured listings as a modest revenue stream. Probably small *"Aanbevolen"* pill in the row corner, soft chalk background, no rank bump (organic ordering preserved). Not pre-launch. Revisit when there's actually demand.

## Open design items

- **The race detail page design.** Own session. Blocks "The race detail page" pitch.
- **Schema markup detail.** What's the minimum viable SportsEvent markup? Schema.org docs + a test deploy will resolve this faster than upfront design.
- **What happens to past races.** After a race date passes, default behavior: stays live with a *"deze editie is voorbij"* banner + auto-link to next edition if one exists. Old race pages are excellent for "X jaar geleden" SEO and link equity.

## Dependencies

- **Needs:** [[01-brand-system-in-code]], [[02-website-foundation]], the FastAPI backend from [[06-coach-backend-woz]].
- **Provides:** the traffic engine that feeds [[04-pilot-intake]] (pilot applications come mostly from race-detail-page visitors who see the pilot card) and the app (the "Krijg de app" CTA on every race page). Also the substrate for [[08-organizer-submissions]] — the submission portal feeds rows into this block's `races` table.
- **Indirectly needs:** the curated race data, which is mostly Luk's work + occasional Claude Code summarization help.
