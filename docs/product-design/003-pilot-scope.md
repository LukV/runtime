---
status: draft
date: 2026-05-26
tags:
  - design
  - scope
project: runtime
---
# Pilot scope

This note covers the *full delivery scope* of the pilot — recruitment, the Wizard-of-Oz coaching loop, and the **initial app build that runs alongside it**. The app is in scope because the pilot has two audiences, not one. The 20 runners are one audience. The coaching partner — the dietist/training-coach who will share the WoZ load with Luk — is the other.

A landing page plus a WhatsApp coaching thread does not, on its own, give a prospective partner enough to commit to. They need to see the product the WoZ is rehearsing. That's what the initial app is for: not the product, the *demonstration* of the product, in the hands of the partner and a subset of pilot runners, while the WoZ runs the real coaching underneath.

Downstream of [[001-product-vision]] and [[002-design-brief]]. If anything in this note contradicts the vision or the brief, those win.

---

## 1. Why an initial app, not just a landing page

The Wizard-of-Oz approach in the vision was correct for validating *whether the coaching loop works*. It is insufficient for the second job the pilot now has to do: **earning a partner**.

The partner is the dietist who already coaches. She is being asked to give 12 weeks of professional time to runners she doesn't know, on a product she can't see, with no clear handoff in either direction. A landing page tells her what Runtime intends to be. A WhatsApp thread tells her how the coaching will be delivered manually. Neither tells her what the product is *becoming* — and that's the question she has to answer to commit.

The initial app's job is to make the product visible. Not feature-complete. Not production-grade. Visible enough that:

- The partner can hold an iPhone and see the three surfaces she's part of: the race calendar with the bound plan attached to it, the intake conversation that produces a plan, and the coaching conversation that adjusts it.
- A subset of pilot runners can use the app in parallel with the WhatsApp coaching, so the partner sees how runners react to the surface she's working behind.
- The WoZ is no longer a *replacement* for the product. It's the *backend* of the product. The coach's WhatsApp messages become messages in the conversation surface. The plan she hand-writes becomes the plan displayed in the app.

This reframing matters. The 12 weeks aren't *pre-product*. They're *product, manually operated*. The partner is not being asked to coach for free in a vacuum. She's being asked to be the human inside an app that exists.

---

## 2. What's in v1

Three surfaces, in this order of priority.

### 2.1 Intake → plan generation (the onboarding flow)

The flow that converts a new user into a runner with a plan. This is where the brief's most important line lands: *Je bent erbij. Vanaf nu ben je een loper.*

**Inputs the intake captures:**

- Recent 5K or 10K time (free text + a *"ik weet het niet exact"* escape)
- Weekly km last month (range buckets: 0–10, 10–20, 20–40, 40+)
- Age bracket (five buckets matching the brief's demographic)
- **Goal — required.** What the runner wants to be able to do. A distance, a time, a combination (*10 km onder het uur*, *een halve marathon afmaken*, *terug aan het lopen geraken na de winter*).
- **Goal race — optional.** A specific public race from the calendar that lands on or near the goal. If the runner picks one, the plan's end date snaps to the race's date. If not, the plan's end date is chosen by the runner (or proposed by the rules engine based on the goal's ambition).

The goal is the spine. The race is a date the goal happens to land on — when there is one. There is no two-flow distinction in the product: every runner has a goal, every runner gets a plan, every runner sees the ribbon. A picked race is metadata on the goal, not a separate mode.

This means the plan length is not fixed at 12 weeks either. The 12-week buildup is the default and the most common case, but a runner with *"terug aan het lopen geraken"* might commit to an 8-week base block; a beginner aiming at a first half marathon might commit to 18 weeks. The rules engine proposes a length based on goal + current fitness; the runner confirms or adjusts. The ribbon scales to whatever length is committed to — it shows the chosen number of weeks, the current week marked with the amber dot, and the goal at the far right.

**The commitment moment.** Lands once, in one place, with one piece of copy: *Je bent erbij. Vanaf nu ben je een loper.* The canonical line from the brief works in every case because the brief's claim is already correct — the identity is granted by the commitment, and the commitment is to the *goal*, not to a public race. A runner who commits to *10 km onder het uur* with no race attached is in exactly the same identity-claim moment as one who commits to Stadsloop Mechelen.

**Flow length:** six to eight screens. Five intake questions, the goal definition, the optional race attachment, the plan preview, the commitment moment.

**What the intake does *not* do in v1:** ask about injuries, ask about preferred running days, ask about pace zones, ask for heart-rate data. Those are real coaching inputs, and in v1 they're captured by the human coach in the first conversation check-in. The app's intake captures the *minimum* the plan logic needs to generate a starting plan; the human partner fills in the rest.

### 2.2 Race calendar + bound plan (the daily-driver surface)

Two surfaces glued together by the same data model.

**Race calendar (Kalender).** The hyper-local race list. v1 ships with **100 hand-curated Flemish races** covering the next 6 months — enough to give every plausible pilot recruit at least three race options within reasonable driving distance and within their training horizon. Each race carries: name, date, distance, location, terrain (road / trail / cross), elevation note (a sentence, not a profile), and a one-line organizer note. No course profile graphics in v1, no historical weather, no organizer contact — those are post-pilot.

The calendar is filterable on three axes: date range, distance, province. That's it. No map view, no search, no "pick a race for me" advisor in v1. The advisor is interesting but is fundamentally an AI surface and adds complexity the partner doesn't need to see to commit.

**The bound plan (Vandaag + Week).** Two views on the same plan.

- **Vandaag** is the hero screen the brief describes. Today's workout, headline, subhead, primary action. The race ribbon at the top showing position in the 12-week buildup. For goal-only users, the ribbon shows the generic finish marker described in §2.1.
- **Week** is the seven-day view. This week's workouts as a vertical list, today highlighted. Reached by pull-down from Vandaag, per the brief.

**What the plan logic does in v1.** The deterministic rules engine described in the vision (periodization, 80/20, 10% volume cap, taper) generates the 12-week plan at intake completion. The plan is stored and shown. **It does not yet auto-rebalance** in v1 — adaptation is done by the human coach editing the plan via a partner-facing admin surface (see §2.4). The app shows whatever plan the coach has set; the coach changes it through admin tooling when the conversation calls for it.

This is the WoZ posture, made explicit: the **rules engine generates the starting plan**, and **the human partner adapts it** for the 12 pilot weeks. Both produce the same artifact — a 12-week plan — and the runner sees no difference.

**Strava integration.** Read-only, one-direction: completed runs sync into Runtime and show as ticks against planned workouts. No writing to Strava, no auto-matching of workout types in v1 (the coach handles that mentally during the check-in). The integration is small and exists for one reason: the partner shouldn't have to ask the runner *"did you do your run on Saturday?"* — she should be able to see it.

### 2.3 Coaching conversation (the check-in surface)

A chat surface inside the app, used once or twice a week. This is the surface that *is* the WoZ during the pilot.

**How it works during the pilot:**

- Runner opens the conversation screen. Sees recent messages from the coach.
- Coach (Luk or the dietist) sends messages from the partner-facing admin surface (§2.4). The runner receives them in the app.
- Runner replies. The reply appears in the admin surface.
- This is text only. No voice notes, no images, no inline workout previews, no quick-reply chips. v1 is plain text both ways.

**Why this matters more than the AI version would.** The brief calls for an AI conversation surface that adjusts the plan via natural language. v1 *is* that surface — except the AI is a human. The partner sees firsthand what the AI will need to be able to do, in their actual voice, with their actual judgment calls. By the end of 12 weeks the partner has effectively written the training data for the eventual AI coach, in real conversations with real runners. That's a meaningful artifact of the pilot, not a side effect.

**Feedback capture.** The conversation surface is also where the runner reports how a run felt — *"de lange duurloop voelde zwaarder dan vorige week"* — and where the coach asks the questions the brief describes (*"hoe voelde de zaterdag?"*). Strava gives the *what*; the conversation gives the *why*. The pair is the coaching loop.

**Notifications: none.** Out of scope for v1. The runner has to open the app to see new coach messages. This is a deliberate constraint — the brief's discipline against engagement-tricked retention applies here. In practice during the pilot, urgent coach-to-runner communication still happens over WhatsApp; the in-app conversation is for the considered weekly check-in, not the *"je bent ziek, sla morgen over"* kind of message. Post-pilot, this becomes the question the brief should answer: do we add notifications, and if so for what.

### 2.4 Partner-facing admin surface (the WoZ console)

Not a fourth user-facing surface. The coach's working surface. Out of the four pieces, this is the only one not in the design brief — because the brief is for the runner-facing product. But the pilot doesn't function without it.

**What it has to do:**

- List of pilot runners with their current plan week, last activity, last message.
- Per-runner view: the runner's intake answers, current plan, recent Strava activities, conversation thread.
- Edit the plan: change today's workout, move workouts between days, regenerate the week, mark a recovery week.
- Send a message into the runner's conversation surface.

**What it does not have to be:** beautiful. This is a tool for two people for 12 weeks. It can be a single-page web app, hosted internally, no design treatment beyond legibility. Same data model as the runner-facing app, different UI on top of it.

This is also where the dietist's commitment lives. She needs to be able to do her coaching work without learning a new piece of software every week. The admin surface should look and feel like a slightly opinionated spreadsheet — because that's what she'll be replacing.

---

## 3. What's deliberately out

Things the brief, the vision, or both call for that are **not** in v1. The UX designer should know these are out so they don't sketch them and waste cycles.

- **Race-day briefing screen.** The brief's biggest brand moment is post-pilot. During the pilot, race-day briefings happen over WhatsApp the night before, from the coach directly. (Only applies to runners whose goal has a public race attached.)
- **Level-up flow** (the three post-race screens in §5 of the brief). Out. The plan ends when the goal date is reached; what comes next is a v2 question.
- **Wedstrijd (race detail) screen.** Calendar entries open to a minimal detail card with the seven fields listed in §2.2. The full Wedstrijd surface from the brief — course profile, weather norms, pacing strategy, briefing — is post-pilot.
- **Profiel screen.** v1 has settings only insofar as the user needs to disconnect Strava or change the goal. Buried behind a single icon, not a tab. No achievements, no past races, no body metrics.
- **Apple Watch and Garmin integration.** Out. Strava only.
- **Notifications, push or otherwise.** Out.
- **Android.** See §4.
- **AI in the conversation.** The conversation surface ships in v1; the AI behind it does not. The human partner is the AI.
- **Plan auto-rebalancing.** The rules engine generates the starting plan; the human partner does the adapting. Auto-rebalance is post-pilot.
- **"Pick a race for me" advisor.** The free funnel feature from the vision. Out of v1 — there's no funnel yet.
- **Language other than Dutch.** Out. The brief is Dutch-first; v1 is Dutch-only.
- **Rich content in messages.** No images, no voice notes, no inline workout previews, no quick replies. Plain text.
- **Onboarding for users without a goal.** A goal is required. Someone who arrives without a goal is sent to a single-screen prompt to come back when they have one — *Geen schema voor er een doel is*, the line from §5 of the brief.

The discipline here is the same as the discipline in the brief: cut anything the partner doesn't need to see to commit, and anything the 20 pilot runners don't need to complete the buildup to their goal. Everything else is post-pilot.

---

## 4. Platform

**iOS-first.** The pilot ships on iPhone only. TestFlight distribution to the partner, to Luk, and to the 20 pilot runners. No App Store release in v1.

The UX designer should design against iOS conventions per §6 of the brief (large title, bottom tab bar with translucency, sheet detents, iOS share sheet, taptic patterns on completion). Android adaptations are post-pilot.

**Build stack: separate discussion.** The vision proposed Flutter so the cross-platform codebase is in place from day one. Swift / SwiftUI is also on the table — it gets the iOS pilot shipped faster and means a Flutter migration happens later, once the product is validated and Android becomes a real target. Either path produces the same v1 the UX designer is sketching against; the choice doesn't change the surfaces, the IA, or the platform conventions. To be decided separately.

**Why iOS-only is acceptable.** The partner uses an iPhone. Most of the pilot's target demographic uses iPhone. The four people who don't can be onboarded over WhatsApp only — they'll be in the WoZ but not in the app demonstration. That's an acceptable v1 gap.

## 5. The IA, simplified for v1

The brief's five-tab structure (Vandaag, Week, Wedstrijd, Kalender, Profiel) collapses to **three tabs plus modal** for v1:

| Tab | Contains | Source in brief |
|---|---|---|
| **Vandaag** | Today's workout, race ribbon, pull-down to Week view | §7 surface 1 |
| **Kalender** | 100-race list, filterable | §7 surface 4 |
| **Coach** | Conversation thread with the coach | §7 surface "AI conversation" |

Plus:

- **Onboarding** modal, first run only.
- A single gear icon in Vandaag's top-right opening a sheet for: disconnect Strava, change goal, leave the pilot, version info. That's the entirety of Profiel in v1.
- **Wedstrijd** is a sheet that opens from any calendar row. Not a tab.

The Week view is reached by pull-down from Vandaag, per the brief. It's not a tab either.

This three-tab structure may be wrong. The UX designer should challenge it. The principle that's not negotiable: every tab the partner sees in v1 should be one she could explain in one sentence to a runner. *"Vandaag is wat je doet, Kalender is wat eraan komt, Coach is waar we praten."* Three sentences. If a fourth tab needs a fourth sentence, it doesn't belong in v1.

---

## 6. The ribbon — one shape, variable length


The brief's hook is the ribbon at the top of every primary screen — evenly-spaced ticks one per week, the current week elevated with the amber dot, the goal flagged at the right edge.

A visual reference exists (the *veld* wordmark prototype): wordmark left, current date right, a horizontal ruler of week ticks below, the amber dot marking the current week, a small flag at week-end. Caption underneath: *WEEK 4 / 12 · MECHELEN OVER 96 DAGEN*. That's the shape.

**The ribbon is goal-bound, not race-bound.** The right-edge marker is the *goal*, and the caption names whatever the runner has committed to:

- Race attached: *MECHELEN OVER 96 DAGEN* (a public race name and a countdown).
- No race attached: *10 KM ONDER HET UUR OVER 47 DAGEN* (the goal as text and a countdown) or similar.

The flag mark at the right edge stays the same in both cases. The flag means *goal*, not *race*. A picked race is one kind of goal; a private distance/time target is another kind of goal. The visual language doesn't need to differentiate them — the caption already does.

**Variable plan length.** The ribbon scales to the committed plan length. The visual reference shows 12 ticks; in practice the ribbon should render legibly between 6 and 18 ticks. The UX designer should sketch the ribbon at three lengths (8 / 12 / 18) to confirm the spacing holds at the extremes and that the amber dot remains the focal element regardless of tick density.

The amber dot has one job and one job only: marking the user's current position in the program. It does not pulse, animate, or change color. It is a small piece of warmth at the top of every screen, doing its work quietly.

## 7. What the UX designer should produce

Three flows, sketched with the brief in their back pocket:

1. **Onboarding** → six to eight screens. The single flow described in §2.1: intake questions, goal definition, optional race attachment, plan preview, the commitment moment (*Je bent erbij. Vanaf nu ben je een loper.*). The most important deliverable.
2. **Vandaag + Kalender + Week** as a single connected surface — the daily driver. The ribbon rendered at three plan lengths (8 / 12 / 18 weeks) to confirm scaling. The Wedstrijd sheet from a calendar row. The variant ribbon caption for goal-without-race.
3. **Coach** conversation surface. Plain text, both directions. Empty state. The first-message state when the coach hasn't messaged yet.

Plus a one-page sketch of:

4. **The partner admin surface** — not full design, just the legibility test. One screen showing the per-runner view (intake, plan, recent activity, conversation). The job here is to confirm the data model in the runner-facing app makes the partner surface tractable, not to design it beautifully.

The sketches don't need to be high-fidelity. They need to be coherent enough that the partner can hold the phone, see the three surfaces, and recognise the product the WoZ is rehearsing.

---

## 8. Going to market — calendar first, coaching partner-gated

The original plan here assumed a coach on board from week one and ran runner-recruiting in parallel with the build (the two-track delivery in §9). That assumption no longer holds, and the go-to-market is resequenced around it.

Two things changed. The coaching partner — *An* in the designs — is not yet found. And the founder-honest constraint: Luk does the partner-and-runner outreach *once the product is at a level he's convinced by*, not before. Outreach is the hard part; it only happens from a position of *"this is real, look."* Against that, recruiting twenty strangers into a coached pilot — before there's a coach, or a convincing app — is the wrong first move.

So the question §8 now answers is narrower and more honest: **what can go public, and earn trust, before a coach exists and before Luk is ready for active outreach?** Three things. None of them depend on the partner.

### 8.1 The calendar goes out first

The public surface is the race calendar, not a recruiting landing page. This is the vision's funnel spine ([[001-product-vision#The race calendar — the spine, and the funnel]]) and the website is already designed calendar-first ([[004-design-system-and-screens#4. The website]]): a genuinely useful list of ~100 Flemish races over the next six months, earning hyper-local SEO (*"stadsloop mechelen 2026"*) and giving every visitor something worth the click whether or not they ever sign up.

The calendar carries the product's whole story without a coach in the room: *kies een wedstrijd, krijg een plan tot eraan toe.* The two CTAs threaded through it (per 004 §4) are resequenced for this phase:

- **App / TestFlight nudge** (ink) — the primary call now. Not *"apply to a coached pilot"*; *"test the app as it's being built."*
- **Waitlist band** (quiet ink) — for the visitor who isn't ready to test but wants to be told when it's ready.
- The **pilot card** 004 §4 placed mid-list is *held* — it promises live coaching there isn't yet a coach for. Its slot is taken, for now, by the **call for partners** (§8.3).

### 8.2 The waitlist is a TestFlight on-ramp, not a someday-list

This is the mechanic that makes the build self-correcting without a coach. The waitlist doesn't collect emails for a far-off launch — it invites runners into the TestFlight build as the app matures. That puts real runners on real screens, and real feedback in Luk's hands, *while* he's still building and *before* there's a partner or a coached pilot. It is the direct answer to the genuine risk in this plan (§8.4): building toward "convincing" in a vacuum.

Honesty discipline, unchanged: no launch-date promise, no fake social proof, no *"join 10.000 lopers."* And one promise that must *not* be made yet — **live human coaching.** Until a partner is on board, the TestFlight app is the calendar, the plan, the ribbon, and the conversation surface; the coaching behind that surface is not staffed. The waitlist sells *early access and a hand in shaping it*, not coaching. Conversion line on the form: *Inschrijven is de eerste training.*

### 8.3 The call for partners is now a first-class surface

Recruiting the coach was always the gating dependency; it stops being a footnote and becomes a public, standing ask. It lives on *Over ons* (the "op zoek naar partners" section, drawn from Luk's own words) and quietly in the calendar where the pilot card used to be. Addressed to coaches, sport scientists, and students sport- en bewegingswetenschappen — anyone who can ground the plans in real coaching science.

The framing is Luk's, and it's load-bearing: **the schedules come from sports science and human expertise, not from AI.** AI's job is to make coaching conversational and accessible — explain a plan, answer a question, translate expert advice into plain language — never to invent the training. A partner reading that understands exactly what they would own and what they would not.

Making this public does two jobs at once. It lets a partner find Luk (inbound) while he is still building toward the moment he is ready to reach out (outbound). And it states the product's integrity commitment in the open, which is itself trust-building for runners.

### 8.4 The honest tradeoff — and the trigger that ends it

This sequencing bends the §1 logic in one direction worth naming. §1 argued the app exists to *earn a partner* by showing her the product the WoZ rehearses. That is still true; what changed is that the showing now happens through a shipped TestFlight build and a live calendar rather than a parallel recruiting push. The app-to-earn-a-partner thesis survives — only the timing moves.

The real risk is the founder one, stated plainly: *"I'll reach out once it's good enough"* has no natural end. Good-enough can recede forever. Two guards:

1. **The TestFlight waitlist forces contact early.** Testers are giving feedback long before the coach or the coached pilot exist. The build is shaped by users either way.
2. **A named trigger, set now, that flips outreach on.** Pick a concrete, falsifiable line — e.g. *calendar live with 50+ races, a TestFlight build that carries a runner through intake → plan → a week of the ribbon, and 10 active testers* — and when it is met, partner outreach and the coached-pilot recruiting (§8.5) begin, convinced-or-not. Without a line, "convinced" is a feeling, and feelings stall.

### 8.5 The coached pilot — gated, not cancelled

The 20-runner coached pilot is still the plan; it is simply downstream of a partner saying yes. Everything written for it holds and waits for that yes.

**The target.** 20 Flemish recreational runners (not elite, not first-timers), roughly 15–65 with flex on the edges, each with a goal race or clear goal in the next 12–16 weeks, willing to do a short weekly check-in (app, or WhatsApp for the iPhone-less minority), basic Strava users, and above all honest and communicative. Selecting for **committed and communicative, not fast.** A 70-minute 10K runner who finishes the twelve weeks and tells us when something doesn't work is worth ten 45-minute runners who ghost in week four.

**The pitch (once there is a coach to back it).** Twelve weeks of free, hands-on coaching from a real coach, tailored to the runner's goal; in exchange, a short weekly check-in, honest feedback, and permission to use what's learned (anonymised) to design the product. What is sold is *be the first 20 in something that's going to be bigger* — older recreational runners respond well to *co-designer*, badly to *beta tester*.

**The channels, ranked by effort-to-yield, run in sequence — not all at once:**

1. **Luk's own network** — highest signal, lowest effort. Running friends, his son's running friends, WhatsApp running circles, co-workers who run, friend-of-friend referrals. Direct personal DMs, not a group blast. *Expected: 5–8.* This is also the channel Luk most avoids; §8.4's trigger exists partly to make him work it.
2. **Local running clubs** — recreational *loopgroepen / joggingteams* over competitive VAL atletiekclubs; better fit for the 40–65 sweet spot. 5–8 clubs within 20 km, a short pitch to the jogging coordinator, an offer of a free 30-minute Q&A at a group run. *Expected: ~2 per responsive club.*
3. **Facebook groups for Flemish runners** — regional and umbrella loopgroepen, Belgium/Flanders Strava clubs. Post **once**, sincerely. Three posts in a week looks desperate. *Expected: 3–5.*
4. **Local race start lines** — 3–4 nearby joggings in the coming weeks, 100 small QR-flyers to `runtime.training`. Side benefit: meet 2–3 race organisers — the start of the calendar-side relationships. *Expected: 2–4, plus organiser goodwill.*
5. **Running shoe stores** — Runners' Lab, Avia Sport, local specialists; offer a free intro session at a group run. Slow, but a future paid-acquisition channel. *Expected: 2–3 per partnered store.*

**Success criteria, when the phase runs:** 20 confirmed within three weeks of starting; 80%+ with a goal within 8–16 weeks; full reachability via the in-app conversation (or WhatsApp); at least three Flemish provinces represented; at least five runners in the 50–65 bracket, the underserved demographic. If 20 isn't hit, the failure mode is almost always channel 1 — Luk held back from asking the people closest to him.

## 9. Delivery, resequenced

The original plan ran three tracks in parallel and timed the partner-commitment conversation to end of week 6. With the partner unfound and outreach deferred to §8.4's trigger, the tracks are no longer parallel — they are a *now* phase and a *gated* phase.

**Phase 1 — now: the app and the two public surfaces.** Build the demonstration, and put the parts that need no coach into the world.

1. Onboarding flow design + copy
2. Vandaag + Week + the ribbon (rendered at three plan lengths to confirm scaling)
3. Kalender with 100 races curated — *and shipped publicly as the website* (the funnel spine, §8.1)
4. Coach conversation surface (the front-end; staffed later)
5. Partner admin surface (functional, ugly) — built ahead, so a partner can be handed a working console the day she says yes
6. Strava read-only integration
7. TestFlight build, opened to the waitlist (§8.2), not just to Luk
8. *Over ons* carrying the live call for partners (§8.3)

Phase 1 has no partner milestone inside it. Its exit is §8.4's named trigger.

**Phase 2 — gated on a partner: recruiting + the coached pilot.** Unlocked when (a) a coaching partner has committed and (b) the §8.4 trigger is met. Then, and only then:

- Runner recruiting runs per §8.5, targeting 20 confirmed within three weeks.
- Runners are onboarded into the app and the WoZ over the following two to three weeks.
- The 12-week WoZ pilot runs with the app as front-end and the human coaches (Luk + the partner) as backend: plan adaptation, weekly check-ins, race-day handoffs over WhatsApp where the app doesn't reach. Plan lengths vary (8–18 weeks); a buildup extending past the pilot window finishes outside it, with coaching agreed case-by-case.

End of Phase 2: the artifacts are the runners' completed buildups, the conversation corpus (which becomes the AI training data), and the partner's decision about whether to stay.

The ordering risk this introduces: Phase 1 can run long while waiting for a "convinced" feeling that §8.4's trigger exists to discipline. If the trigger is met and no partner has appeared through the inbound call (§8.3), that is the signal to begin *active* partner outreach — the hard, deferred thing — not to keep polishing.

## 10. Open questions

Things the scope makes confident choices on but where the partner or the UX designer might push back:

1. **The goal is the spine, not the race.** Departs from the vision's "race-bound plan" framing — but doesn't contradict its underlying claim. The vision's insight is that *the commitment* is what grants the identity of runner. A race is one form that commitment takes; a private distance/time goal is another. v1 treats both as first-class. The risk: marketing copy on the landing page and in the App Store description that overweights "race-bound" will mismatch the product. Worth a copy audit before launch.
2. **Variable plan length.** Plans run between 8 and 18 weeks depending on goal and current fitness, not a fixed 12. Cleaner for users, harder for the rules engine to get right at the extremes (an 8-week buildup for a runner returning from injury is a different periodization shape than a 12-week buildup for a fit runner). The partner's judgment will catch the edge cases during the pilot. Worth flagging the asymmetric ones to her early.
3. **Coach conversation as the *only* in-app communication channel.** No notifications means runners might miss messages for days. Acceptable in the pilot, but it's the kind of friction that masks real product issues — *"the coach didn't respond"* and *"I didn't see the coach respond"* look the same from the data. Worth instrumenting carefully.
4. **The partner admin surface as ugly-on-purpose.** Risk: the partner experiences the *admin* surface more than the *app* surface, and her gut feeling about Runtime gets shaped by the wrong artifact. Counter-argument: she's a professional, she'll judge the product by the runner-facing surface, not the tool. Worth checking with her directly after the first week of use.
5. **No Wedstrijd detail in v1.** The race detail sheet has 7 fields. It works. But if a recruit asks *"can I see the elevation profile of Lokeren?"* the answer is "no, you'll get a description from the coach." That might be enough. Or it might be the one omission that makes the app feel half-built to the partner.
6. **Three tabs, not five.** Designed to be defensible in one sentence per tab. The UX designer might find that Coach belongs higher in the IA (it's the surface that does the most work) or that Kalender can be demoted (most runners pick a race once and don't return). Both are plausible; both should be tested.
