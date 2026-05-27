---
project: runtime
type: planning-block
block: coach-backend-woz
status: not-started
updated: 2026-05-26
---
# Block 6 — Coach Backend & WoZ Operation

The plumbing that makes the dietist-as-AI work. From the runner's perspective, the app *has* a coach — messages arrive, plans adapt, the system feels alive. From An's perspective, it's a structured workspace: she sees twenty runners, their Strava activity, their plan, their last messages, and she does the thinking. The backend is the bridge.

Per [[../../product-design/004-design-system-and-screens#Partner admin console — the coach's view]] this surface has been designed — runner list left, detail pane right, three info zones (this week / Strava 7-day / conversation), one CTA (*"Plan aanpassen"*). The design is the legibility test; this block is the actual build.

Plus the data model that everything else reads from. The runner's plan, today's workout, the adaptation flags, the chat messages, the goal race — all of it in Supabase Postgres, exposed via FastAPI, consumed by both the iOS app and the coach console.

**This block also includes the FastAPI scaffold itself** — it's the largest API-shaped block, so the API setup pitch lives here. Other blocks ([[03-race-calendar]], [[04-pilot-intake]], [[08-organizer-submissions]]) add their endpoints on top.

Design: [[../../product-design/004-design-system-and-screens#Partner admin console — the coach's view]] + [[../../architecture/001-stack-decisions]].

## Pitches

### FastAPI scaffold + Railway deploy — *an evening*

The API foundation. New FastAPI project in `apps/api/`. Dependencies: `fastapi`, `uvicorn`, `pydantic`, `supabase-py`, `python-jose` (for verifying Supabase JWTs), `resend`. Pinned with `uv` or `poetry`.

Folder structure:
```
apps/api/
  main.py
  routers/
    races.py      (for block 03)
    pilot.py      (for block 04)
    runners.py    (this block)
    coach.py      (this block, admin endpoints)
    organizers.py (for block 08)
  models/         (Pydantic schemas)
  db/             (Supabase client, query helpers)
  auth/           (JWT verification, role gates)
  email/          (Resend client, template senders)
```

Railway deploy on push to `main`. Single environment for v1. Auto-generated OpenAPI at `/docs` (admin-protected in production).

*Out of scope.* Multiple environments (staging/prod), database migrations from FastAPI side (Supabase CLI handles it), background workers / Celery.

### Schema for the runner data model — *a weekend*

The full pilot operational schema. Builds on `pilot_applications` from [[04-pilot-intake]]:

```
runners
  id (uuid)
  application_id (fk to pilot_applications, when source is pilot)
  email (text)
  display_name (text)
  device_token (text, hashed)  -- the per-device auth token
  cohort_id (fk, nullable)
  current_plan_id (fk, nullable)
  status (enum: pending-claim, active, paused, dropped)
  started_at, claim_code, claimed_at

cohorts
  id (uuid)
  name (text)
  starts_at, ends_at
  notes (text)

plans
  id (uuid)
  runner_id (fk)
  template_name (text)
  total_weeks (int)
  goal_text (text)
  goal_race_slug (text, nullable)
  start_date, end_date
  status (enum: active, completed, abandoned)
  created_at

workouts
  id (uuid)
  plan_id (fk)
  date (date)
  week_number (int)
  day_of_week (int 1-7)
  type (enum: tempo, duurloop, lange-duurloop, intervallen, rust, race)
  distance_km (numeric, nullable)
  target_pace (text, nullable: "4:38")
  structure (text)  -- "5 min inlopen · 4 km tempo · 2 min wandel · 5 min uitlopen"
  status (enum: upcoming, completed, skipped)
  completed_at

messages
  id (uuid)
  runner_id (fk)
  sender (enum: runner, coach)
  body (text)
  sent_at
  read_at (timestamp, nullable)

adaptations
  id (uuid)
  runner_id (fk)
  type (enum: ahead, injured, weather, other)
  week_affected (int)
  was (jsonb)  -- snapshot of the affected workouts before adaptation
  wordt (jsonb)  -- snapshot after
  message_body (text)
  fired_at
  acknowledged_at (nullable)
```

RLS: runners can only read their own data (auth via device token); admins can read/write everything. The device token check happens in FastAPI (not Supabase RLS) since runners don't have Supabase Auth accounts.

*Migration note.* When a pilot application gets accepted (status → `accepted`), a row is created in `runners` with a one-time claim code. The app uses the claim code to exchange for a device token on first launch.

### iOS device-token auth flow — *an evening*

Per [[../../architecture/001-stack-decisions#iOS auth: per-device tokens, not Supabase Auth]]. Three endpoints:

- `POST /api/auth/claim` — body: `{ claim_code, device_id }`. If valid, returns a long-lived device token and clears the claim code from the runner row. Idempotent: re-claiming with the same `device_id` returns the same token.
- `GET /api/auth/whoami` — header: `Authorization: Bearer {device_token}`. Returns the runner profile. The app calls this on every launch to verify the token is still valid.
- `POST /api/auth/revoke` — invalidates the token (for "log out" or "lost phone" flows). Optional v1.

Tokens stored hashed in `runners.device_token`. Last-used timestamp tracked for security review.

### Core runner endpoints (FastAPI) — *a week of evenings*

The endpoints the iOS app actually calls. All require device-token auth except where noted.

- `GET /api/runner/today` — today's workout, ribbon state (current week, total weeks, goal label), any pending adaptation. Polled on app launch and pull-to-refresh.
- `GET /api/runner/week` — the current 7-day plan, for the Week view (deferred to v2 but the endpoint can exist).
- `GET /api/runner/profile` — runner data + goal + race + plan summary.
- `GET /api/runner/messages` — conversation thread (paginated). Polled on Coach tab open + every 30s when active.
- `POST /api/runner/messages` — body: `{ body }`. Inserts a runner message, triggers Slack notification to An.
- `POST /api/runner/workout/{id}/complete` — marks a workout completed. Updates plan progress.
- `POST /api/runner/adaptations/{id}/acknowledge` — runner tapped "Akkoord" on an adaptation modal.

All return Pydantic-typed responses. OpenAPI auto-generated for the app team (which is Claude + Luk).

### The coach console — Next.js admin page — *a week of evenings*

`runtime.training/coach` — protected by Supabase Auth (admin role). Built in the same Next.js project as the rest of the website. Talks to FastAPI for all reads/writes.

The partner admin from [[../../product-design/004-design-system-and-screens#Partner admin console — the coach's view]], built. Layout:

- **Left rail:** all 20 active runners. Sorted to surface concerns (no activity in N days, missed workouts, pending messages). Each row: name, current week, goal, last activity, last message timestamp.
- **Detail pane:** selected runner. Three zones (deze week / strava 7 dagen / gesprek). Plus the *"Plan aanpassen"* action button.
- **Top nav:** runner list, *"Aanmeldingen"* (the pilot moderation queue from [[04-pilot-intake]]), *"Submissions"* (the organizer race queue from [[08-organizer-submissions]]).

*"Plan aanpassen"* opens a sheet where An can edit the runner's upcoming workouts. Same data model, just an editor view. Save triggers an `adaptation` row + a push notification to the app.

*"Strava 7 dagen"* in v1 is manually-entered notes from An. v2 wires the Strava API.

*Risk.* Concurrency — what if An is editing a plan while the runner is requesting their workout? Default to "last write wins" with an optimistic-locking version number. Acceptable for two users and one runner at a time.

### Notifications for An — *an evening*

When a runner sends a message, An needs to know in real-time. Slack webhook to a private channel — every new runner message dings her there with a link to the console.

Implementation: FastAPI's POST message endpoint fires a webhook after the DB insert. Simple. Webhook URL in env vars.

*Out of scope.* WhatsApp / SMS notifications (Twilio costs money), email digests (delayed, breaks the real-time feel).

### Push notifications to runners — *an evening*

APNs (Apple Push Notification service) integration. Requires the Apple Developer Account from [[05-ios-app-downsized]]. Pushes triggered by:

1. New message from An (Coach tab)
2. New adaptation fired (Vandaag modal on next open)
3. Optional: morning workout reminder (toggleable in settings)

Token registered on first app launch, stored in `runners.apns_token`. FastAPI uses `apns2` or similar to send.

Plain Dutch copy. *"Een bericht van An"*, *"Plan vanmorgen aangepast"*, *"Vandaag: tempo 8 km"*.

### The "An kijkt mee" loop — *an evening*

The brand promise from [[../../product-design/004-design-system-and-screens#Coach conversation]] is that An asks one or two questions per week. This is the WoZ heartbeat that proves the coach is alive.

Console has a "weekly nudge queue" — every Sunday evening, displays one prompted message per runner based on simple rules:
- Runner asked nothing this week → *"Hoe ging de week?"*
- Runner missed a workout → *"Saw je hebt donderdag overgeslagen — alles ok?"*
- Runner completed a hard week → *"Goed gedaan deze week. Hoe voelt het?"*
- Long run coming up Saturday → *"Klaar voor de lange duurloop?"*

An reviews, edits as needed, sends. Takes ~30 minutes per week across 20 runners.

*Why this matters.* Without this, the Coach tab silently rots. An is busy — without a prompt, she'll miss runners. This isn't automation — it's a coach's checklist.

### Adaptation tooling — *an evening*

When An wants to fire one of the three designed adaptations ([[../../product-design/004-design-system-and-screens#Adaptation states — three triggers]] — ahead/injured/heat), she should have a templated workflow:

1. Pick the adaptation type from the runner's detail pane.
2. UI auto-fills the *was* (snapshot of next 7 days of workouts) and lets her edit the *wordt*.
3. Writes the message body, with a placeholder template per adaptation type.
4. Hit send. App fires the modal on next launch.

Without this, every adaptation is hand-typed in the DB — error-prone. With it, the right copy lands consistently.

## Open design items

- **The plan template library.** An needs starting plans to adapt — 12-week / 16-week / 8-week templates for each goal type (10K finish, 10K under hour, halve marathon, marathon). These are the *base* she copies and modifies per runner. **Luk + An write 4-6 of these together.** Not a design exercise — actual training-plan content. Probably the second-biggest non-code work in the plan after race curation. Lives in `plan_templates` table or as seeded `plans` rows.
- **What happens when An is on holiday.** The pilot is 12 weeks. An will need at least one week off. Either Luk covers her, or we communicate *"An is even weg, plannen lopen op autopilot"* in the app, or we have a backup coach. Decide before launch.
- **The console design itself.** The legibility test in [[../../product-design/004-design-system-and-screens#Partner admin console — the coach's view]] established the data layout, not the polish. Real build needs a quick design pass — utilitarian, sans-only, no display type. Small enough to do inside the pitch.

## Dependencies

- **Needs:** [[01-brand-system-in-code]] (console uses tokens), [[02-website-foundation]] (same Next.js project, Supabase Auth already set up), [[04-pilot-intake]] (Applications → Runners flow when accepted).
- **Provides:** the backend [[05-ios-app-downsized]] talks to. The app is hollow without this block. Also provides the API foundation that [[03-race-calendar]] and [[08-organizer-submissions]] add endpoints to.
- **Out-of-band:** the actual training plans. That's An and Luk writing prose, not a code pitch.
