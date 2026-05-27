---
project: runtime
type: planning-block
block: organizer-submissions
status: not-started
updated: 2026-05-26
---
# Block 8 — Organizer Submissions

The lightweight portal that lets race organizers add and update their own listings, with Luk as the moderator gatekeeper. Real work, ships at launch — not deferred.

Why this matters: hand-curating 100 races to launch is feasible. Hand-curating 300+ races to sustain the calendar across two cycles per year is not. The submission portal is what turns Runtime from "a calendar Luk maintains" into "a calendar the Vlaamse running community contributes to and Luk curates." That distinction is the long-term moat from [[../../product-design/001-product-vision]].

This block is *small but real* — not deferred to v2. Without it, organizer outreach in [[07-launch-and-recruitment]] is unconvincing (*"submit your race"* with no submission flow looks unserious). With it, every race detail page can carry a *"is dit jouw wedstrijd? Houd hem actueel"* footer that converts organizers into contributors.

Design: not yet drawn. Probably needs its own product-design note (`005-organizer-portal.md` or similar) before the build pitch can start.

## Pitches

### Organizer signup + login — *an evening*

Supabase Auth with the `organizer` role. Self-service signup: email + organization name + a few details (atletiekclub? commercial organizer? municipality?). Email confirmation via Resend. Login at `runtime.training/organizers`.

*Out of scope.* Social login, password recovery flows fancy enough to need a design pass (Supabase's default templates are fine for v1, restyled minimally with Runtime branding).

### The organizer dashboard — *a weekend*

After login, the organizer lands on `runtime.training/organizers/dashboard`. Three things visible:
1. **Their submitted races** — list with status (`pending review`, `live`, `needs edits`).
2. **A *"Wedstrijd indienen"* button** — primary CTA, opens the submission form.
3. **A short *"hoe werkt het"* explainer** — three lines: *"Je dient in. Luk bekijkt. Je wedstrijd staat live binnen 48 uur."*

Empty state for new organizers: just the explainer + the submit CTA, large. No fake testimonials, no "0 races" counter.

### The race submission form — *a weekend*

The form an organizer fills in to submit a race. Fields per [[03-race-calendar]] curation requirements:

- Name + edition number
- Date + start time
- Distance(s) — single value or multiple if wave event
- Terrain (weg / cross / trail)
- City + province (autocomplete)
- Parcours description (2-3 sentences)
- Organizer info (autofilled from their profile)
- Official inschrijving URL
- Editorial notes (optional, but encouraged — *"Lichte klim aan km 7"*, *"Trekt vaak families"*)

Submit creates a row in `race_submissions` with status `pending`. Triggers a Resend email to Luk: *"New race submission: {name}, {date}"*.

*Risk.* Organizers will get the editorial-notes field wrong — too marketing-y, not enough actual content. Mitigation: examples inline (*"hoe ziet een goed parcoursverhaal eruit? Bijvoorbeeld: 'Start aan de Grote Markt, door de oude binnenstad, met één klim aan kilometer 7. Aankomst aan de Dijle.'"*). Plus admin can edit on review.

### The admin moderation queue — *a weekend*

Lives at `runtime.training/coach/submissions` — same Supabase Auth surface as the coach console (admin role only). For each pending submission Luk sees:
- The full submitted data
- The organizer's profile (other submissions, account age)
- Three actions: **approve** (race goes live), **edit + approve** (Luk fixes the parcours notes inline before approving), **request changes** (sends an email back to the organizer with notes)

Approved races flow into the public `races` table. Same schema as Luk's hand-curated races — no second-class citizenship. Once approved, the organizer can request edits, but those also go through the queue.

*Why edit-before-approve matters.* Curation quality is the brand. Luk shouldn't have to choose between *"approve this slightly weak parcours description"* and *"reject it."* He should be able to rewrite it in 30 seconds and approve. That's the moat.

### The race-page contributor footer — *an evening*

On every race detail page (from [[03-race-calendar]]), a small footer block: *"Is dit jouw wedstrijd? Houd hem actueel."* + a link to claim it. If the race was submitted by an organizer, this is a no-op (already claimed). If it's one Luk hand-entered, the link triggers a flow where the organizer can request ownership — Luk verifies via email and assigns.

*Why this matters.* Half of organizer recruitment will happen *through* the calendar pages themselves. A race director Googles their own race, lands on Runtime, sees this footer, signs up. Free flywheel.

## Open design items

- **The organizer portal needs its own design pass.** None of these surfaces have been drawn. Probably a small `005-organizer-portal.md` design note that establishes the visual register (it should feel like the same product as the coach console — utilitarian, sans-only, no display type) without re-deriving every token.
- **What happens when an organizer submits a race for a city/club we already have a different entry for.** Duplicate detection on city + date + distance — Luk reviews ambiguous matches. Probably a small heuristic + admin judgment.
- **Submission rate-limiting.** A bored organizer submitting 50 races at once. Cap at, say, 5 pending submissions per organizer until at least one is approved. Tightens automatically over time.

## Dependencies

- **Needs:** [[01-brand-system-in-code]] (tokens), [[02-website-foundation]] (Next.js + Supabase + Resend already set up), [[06-coach-backend-woz]] (the admin auth pattern + the FastAPI conventions), [[03-race-calendar]] (the `races` table and detail page exist).
- **Provides:** the long-term curation flywheel that makes [[03-race-calendar]] sustainable past 100 races. Enables organizer outreach in [[07-launch-and-recruitment]] to actually convert.
