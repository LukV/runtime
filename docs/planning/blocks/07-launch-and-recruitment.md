---
project: runtime
type: planning-block
block: launch-and-recruitment
status: not-started
updated: 2026-05-26
---
# Block 7 — Launch & Recruitment

Everything that turns a built thing into a used thing. The recruitment channels per [[../../product-design/003-pilot-scope#8]], the launch sequencing, the post-launch feedback loop, the soft positioning work in the loopgroepen and Strava clubs. Mostly non-code work — outreach, copywriting, conversations, follow-up.

This block runs **in parallel with everything else** from week 2 onward — recruitment starts the moment the intake page is live, not when the app is ready. Pilot applications accumulate while the rest is being built.

The goal: 20 selected runners by end of week 8, with geographic spread across all five Flemish provinces and a mix of paces/ages/goals.

Design: [[../../product-design/003-pilot-scope#8]] (recruitment strategy + selection criteria).

## Pitches

### The recruitment list — *an evening*

Build the master list of *channels* to reach:

- **Loopgroepen / running clubs** in each of the five provinces — the public ones (atletiekclubs), the informal ones (Facebook groups, Meetup running groups). Aim for 10-15 per province, prioritizing those with active social presence.
- **Strava clubs** — Flemish Strava clubs (search by location), prioritizing those with 50+ members and recent activity.
- **Local race organizers** — every organizer in [[03-race-calendar]]'s curated 100 has an audience. Some will share a pilot announcement with their list.
- **Luk's personal network** — anyone he knows who runs.
- **Press / media** — small Flemish running publications (running.be has a community section), local newspapers (Het Nieuwsblad, HLN have hyper-local pages).

Output: a single Airtable table (or spreadsheet) with channel name, contact, last-touched, status, notes. Tracks the recruitment funnel.

### Outreach copy — three versions — *an evening*

Three short messages, ready to send:

1. **To running clubs / loopgroepen** — *"Wij zijn Runtime. We zoeken 20 Vlaamse lopers voor een coaching-pilot…"* Personal, warm, with Luk's signature.
2. **To Strava clubs** — slightly shorter, more direct. Strava community is post-savvy.
3. **To race organizers** — different framing. *"We bouwen runtime.training — een Vlaamse hardloopkalender. Mogen we jouw evenement opnemen?"* The pilot is a soft secondary mention. The first ask is calendar listing.

All three in Luk's voice from [[../../product-design/002-design-brief]]. None pushy. None hyped.

### The soft launch — *a weekend*

When the calendar has 25+ races and the intake page is live (but before the app is in the store), do a small private announcement to:

- Luk's network
- 5-10 hand-picked loopgroepen in Antwerp and Mechelen first
- Maybe one Strava club Luk's part of

Goal: validate the page, get the first 5-10 applications, learn what's confusing. Stay narrow on purpose — a noisy public launch before the app is ready burns the *"runtime sounds cool but where's the app?"* objection without anything to answer it.

### The public launch — *a weekend*

When the app is in TestFlight or App Store and the calendar has 50+ races:

- Public announcement on Strava (Luk's profile, every relevant club)
- Posts in 30-50 loopgroep Facebook groups
- Outreach to race organizers in the calendar — *"Your race is featured at runtime.training/wedstrijd/{slug}, please consider sharing"*
- One press release to running.be and 2-3 regional newspapers
- A *"Wij zijn live"* page or section on runtime.training itself

### Application review workflow — *ongoing, every Friday evening*

Weekly batch processing. Luk reviews the week's applications, scores them on the three criteria from [[../../product-design/003-pilot-scope#8]] (reliability, geographic spread, mix of paces), and accepts/waitlists/declines. Updates Airtable status. Email triggers per [[04-pilot-intake]].

Document this as a *checklist* in the planning folder — not a pitch, more an SOP — so it's not invented every Friday. Probably one A5 page of decisions.

### Onboarding the first 5 runners manually — *ongoing, week 8-9*

The first 5 accepted runners are An's calibration cohort. Each one gets:
- A welcome email from Luk (the [[04-pilot-intake]] template, customized)
- A first message from An via the Coach tab (or WhatsApp if the app isn't quite ready yet)
- The first week of their plan, hand-written by An based on the [[06-coach-backend-woz]] template library
- A check-in call from An at end of week 1 — non-optional, builds trust

By the end of week 9, those 5 runners' patterns inform the templates and tooling. Then onboard the next 15 in week 10 in two batches, with much less manual hand-holding.

### Press kit + media one-pager — *an evening*

Single PDF + a `runtime.training/press` page. Logo, brand line, 100-word description, 300-word description, three high-res screenshots, Luk's bio + photo, contact email. Saves us from being the bottleneck when someone wants to write about Runtime.

*Out of scope.* Press release writing for every news cycle. We do that ad-hoc.

### Feedback loop — *ongoing through the pilot*

Per [[../../product-design/003-pilot-scope#1]] the pilot is also a learning exercise. The plumbing:
- One-on-one calls with each pilot runner at week 4, week 8, week 12
- A short anonymous form (NPS-style + 2 free text questions) at end of pilot
- Luk + An journal weekly observations in a shared doc — what's working, what's friction, what's surprising

The output of this is what informs v2.

## Open design items

- **What "soft launch" actually triggers.** Is it the moment the calendar has 25 races and the intake form works? Or do we hold until TestFlight is live? **Default to: when the calendar has 25 races and intake works**, regardless of app status. The risk of waiting for everything is silence eats momentum.
- **Whether to do a "founders email" weekly newsletter during the pilot.** A short *"hier is waar Runtime staat"* note every two weeks to applicants, pilot runners, and the waitlist. Builds trust through transparency. Cost: ~30 min every two weeks. Probably yes.

## Dependencies

- **Needs:** [[02-website-foundation]] + [[03-race-calendar]] (the soft launch needs a credible site) + [[04-pilot-intake]] (the form to point people at).
- **App is preferred but not blocking** — soft launch can run with intake-only. Public launch needs at least TestFlight.
- **Provides:** the runners that [[05-ios-app-downsized]] and [[06-coach-backend-woz]] exist for. Without this block, the whole stack has no users.
