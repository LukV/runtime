---
project: runtime
type: planning-block
block: pilot-intake
status: not-started
updated: 2026-05-26
---
# Block 4 — Pilot Intake

The funnel that converts calendar-page visitors and outbound-recruitment leads into the 20-person pilot cohort. One landing page, one form (the rich intake), one simpler form (the general waitlist), four email templates, two Supabase tables. Smallest block by volume, highest leverage per evening — without this, the pilot doesn't have runners and the whole rest of the system has no users.

Per [[../../product-design/004-design-system-and-screens#The screens]] the five questions are: recent 5K/10K time, weekly km, age, goal (or doelwedstrijd), and agreement to weekly check-ins. These are nearly identical to in-app onboarding ([[../../product-design/004-design-system-and-screens#Onboarding — goal and race-attach]]) — so designing this surface produces reusable copy and structure for the in-app version later.

Per [[../../product-design/003-pilot-scope#8]] applications are selected on betrouwbaarheid + geografische spreiding, not speed. Selection happens manually, one weekly batch. We respond within 7 days — even to noes.

**Two distinct tables, two distinct flows:**

- `pilot_applications` — rich form, 5 questions + email, scored manually, status workflow (`pending` → `accepted` / `waitlisted` / `declined`).
- `waitlist_entries` — simpler, email + first name + optional *"wat zoek je?"* one-liner. For people who land on the calendar pages and want to hear about Runtime in general.

Both in Supabase per [[../../architecture/001-stack-decisions]].

Design: [[../../product-design/004-design-system-and-screens#The screens]] (the pilot intake preview cards) + [[../../product-design/003-pilot-scope#8]] (recruitment + selection criteria).

## Pitches

### Schema for `pilot_applications` + `waitlist_entries` — *an evening*

Postgres tables:

```
pilot_applications
  id (uuid)
  email (text, unique)
  recent_time_5k_10k (text, free-form: "28:12" or "rond de 50 minuten")
  weekly_km_bracket (enum: 0-10, 10-20, 20-40, 40-plus)
  age_bracket (enum: 14-24, 25-39, 40-54, 55-65, 65-plus)
  goal_text (text, free-form Dutch)
  goal_race_slug (text, nullable, fk-like to races.slug)
  weekly_checkin_agreed (boolean, must be true)
  status (enum: pending, accepted, waitlisted, declined)
  reviewed_by (uuid, fk to auth.users)
  review_notes (text, internal)
  submitted_at, reviewed_at, accepted_at

waitlist_entries
  id (uuid)
  email (text, unique)
  first_name (text, nullable)
  intent_text (text, nullable, optional "wat zoek je?")
  source (text, nullable: utm-style attribution)
  created_at
```

RLS: both tables write-only public (via FastAPI), read-only admin. No public read endpoint — applications and waitlist are private data.

### FastAPI intake endpoints — *an evening*

- `POST /api/pilot/apply` — accepts the full form, validates, inserts, triggers confirmation email via Resend.
- `POST /api/waitlist/join` — minimal form, dedup by email (return success on re-submit, don't error), triggers welcome email.
- `GET /api/pilot/applications` — admin-only (Supabase Auth required). For the moderation queue.
- `PATCH /api/pilot/applications/{id}` — admin-only. Changes status, triggers the right outbound email.

Rate limiting: 5 submissions per IP per hour (honeypot + simple counter, no CAPTCHA).

### The pilot landing page — *a weekend*

`runtime.training/pilot` — standalone landing that explains the pilot before asking. Different shape from the calendar-embedded pilot card: this is where someone Googling *"runtime training pilot"* or arriving from a Strava-club post lands. The form is anchored at the bottom but the *top* of the page builds trust first.

Structure:
1. Hero: *"Wij coachen je gratis tot aan de finish."* / *"12 weken hands-on coaching. 20 plaatsen. Voor Vlaanderen."*
2. Wat krijg je — three-card block (een plan, een coach, een wedstrijd)
3. Wat verwachten wij — three-card block (wekelijkse check-in, eerlijke feedback, toestemming om te leren)
4. Wie selecteren we — short paragraph on the criteria. *"Niet de snelste. De betrouwbaarste."*
5. Luk + An — small two-portrait strip with one paragraph each
6. The form (anchored, with `id="aanmelden"` so other pages can link directly)
7. *"We laten het binnen 7 dagen weten — ook als het een nee is."*

*Out of scope.* FAQ section. Testimonials (we don't have any yet and fake ones would contradict everything).

### The intake form component — *a weekend*

The five questions per [[../../product-design/004-design-system-and-screens#The screens]] + an email field. Single page, scrolling, not Typeform-style. Each question is a small card.

The fifth question — *"Akkoord met wekelijkse check-in?"* — is the inverted ink card, same treatment as in the design preview. The real commitment moment.

POSTs to `/api/pilot/apply`. Redirects to `/pilot/bedankt` on success.

*Risk.* Forms get spammed. Honeypot field + rate limit by IP. No CAPTCHA.

*Open question.* Validation strictness on the 5K/10K time field. **Free text with a placeholder example** (`bv. 28:12 of "rond het uur"`) — a runner who can't write *"28:12"* in a text box isn't ready for the pilot anyway.

### The waitlist form component — *an evening*

Smaller. Lives as a band inside the calendar pages (per the calendar website design). Plus a `/wachtlijst` page for direct linking. Three fields: email (required), first name (optional), one-liner *"wat zoek je?"* (optional). POSTs to `/api/waitlist/join`.

Reuses the input styles from the intake form. Submit button in veldgroen (the second sanctioned veldgroen use after dark-mode CTAs).

### The "bedankt" page — *an evening*

`runtime.training/pilot/bedankt` — second copy moment after submission. Two paragraphs, no fanfare:

> *"Bedankt. Je aanmelding is binnen."*
> *"We bekijken aanmeldingen wekelijks. Binnen 7 dagen krijg je een mail — of een ja, of een nee, of een 'we plaatsen je op de wachtlijst'. Geen van de drie is een formele afwijzing — een nee voor deze cohort is geen nee voor Runtime."*

Plus a small grey footer: *"Tot dan: je kunt onze [[../03-race-calendar|kalender]] doorbladeren."*

### Email templates (React Email) — *a weekend*

Four templates in `packages/email/` (per [[../../architecture/001-stack-decisions#Repositories]]), authored in React Email, sent via Resend:

1. **Confirmatie pilot** — sent immediately on form submit. *"We hebben je aanmelding goed ontvangen. Hier is wat je hebt ingevuld [recap]. We laten binnen 7 dagen weten."* Includes an "update via reply" mention.
2. **Welkom in de pilot** — sent on acceptance. Personal, from Luk. *"Je bent erbij. Hieronder de volgende stappen…"* Links to TestFlight or app download (placeholder for v1).
3. **Niet deze keer** — the hard one. *"We hebben deze keer 20 anderen gekozen — vooral op spreiding over Vlaanderen. Je staat op de wachtlijst voor de volgende cohort."*
4. **Welkom op de wachtlijst** — minimal. *"Bedankt. We sturen je een mail als er iets verandert — niet vaker dan eens per kwartaal."*

All four in Dutch, Luk's voice from [[../../product-design/002-design-brief]]. **Niet deze keer** is the design test — dignifying a no is harder than celebrating a yes.

### Admin moderation queue in `/coach` — *an evening*

Built as part of [[06-coach-backend-woz]] — referenced here. The coach console has a *"Aanmeldingen"* tab where Luk sees pending applications, scores them by criteria, sets status. Status change triggers the right outbound email automatically.

## Open design items

- **What the post-acceptance flow looks like, end-to-end.** Depends on app readiness — if TestFlight is live, the welcome email includes the link. If not, the email says *"verwacht binnen X dagen een berichtje van An via WhatsApp"*. Decision deferred until close to launch.
- **The form itself, designed.** Preview cards in [[../../product-design/004-design-system-and-screens#The screens]] are the explanation. The form needs its own quick design pass — small enough to do inside the pitch.

## Dependencies

- **Needs:** [[01-brand-system-in-code]], [[02-website-foundation]], the FastAPI backend from [[06-coach-backend-woz]].
- **Provides:** the pipeline that feeds [[06-coach-backend-woz]] (accepted applications convert to runners) and [[05-ios-app-downsized]] (accepted runners get app access).
