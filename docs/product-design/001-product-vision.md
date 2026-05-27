---
date: 2026-05-25T00:00:00.000Z
project: runtime
status: draft
tags:
  - product-vision
  - training-plan
  - race-calendar
---

# runtime — product vision

## The insight

You don't become a runner when you cross the finish line. You become a runner the moment the the moment you commit to a goal, and your training stops being abstract and starts pointing at a specific date on a specific start line.

That's the gap recreational runners actually live in. Not the gap between unfit and fit. The gap between *I run sometimes* and *I am a runner*. The finish line doesn't grant the title. The startline does.

**Runtime is the running coach built around that distinction.**

The name carries the thesis. In software, *runtime* is the moment code stops being theory and starts executing. In running, runtime begins the moment you commit to the distance. Identity before proof. Commitment before achievement. Execution over intention. Progress over perfection.

## The product

Runtime is a goal-driven, AI-assisted training companion for recreational runners. It combines a hyper-local race calendar (starting in Flanders) with an adaptive training plan that's bound to the race you pick — its date, distance, terrain, and weather norms — and coaches you through the 12 weeks leading up to it via a conversational AI that adjusts when life gets in the way.

The race-bound plan is the product expression of the insight. Every workout has meaning because it's pointing at a real date on a real start line. Every workout is also evidence — proof that the commitment is being honoured. The product takes the runner's self-claim seriously and makes it physical.

## The problem it solves

Recreational runners today live with two broken tools.

**Race calendars** (jogging.be, loopkalender.be, kalender.atletiek.be) are static databases — useful twice a year, no personalization, no help deciding what to do about a race once you've found it.

**Training apps** (Runna, Nike Run Club, Garmin Coach) generate generic plans for abstract goals like "run a 10K" — disconnected from the actual race you'll run, blind to its terrain or weather, unaware that you live in Flanders and your goal race is Stadsloop Mechelen on August 30th.

The downstream effect: training without a concrete external goal is psychologically hard to sustain. People train better when they're training for a specific race they've signed up for — every running coach knows this. But no current tool builds the whole product around that fact. The race is treated as the *output* of training instead of the *spine* of it.

Runtime closes that loop. The race calendar isn't a separate product — it's the spine of the training plan. The runner doesn't train *and then* race; the runner trains *because of* the race.

## The journey

Runtime is not built around a single 16-week marathon block. It's built around an arc that takes someone from their first local 5K to the distance they once thought was impossible — one commitment at a time.

```
5K
↓
10K
↓
10 Miles
↓
Half Marathon
↓
Marathon
```

The runner's relationship with Runtime moves through five states:

> Discover → Commit → Train → Finish → Level Up

- **Discover.** A local race becomes visible in the calendar. Maybe it's a stadsloop in the next town. Maybe it's a club jogging the runner has heard about for years.
- **Commit.** They sign up. The moment they do, Runtime says: *you're in*. The 12-week plan generates. The race becomes the spine.
- **Train.** Twelve weeks of adaptive coaching — base, build, peak, taper — bound to the race they picked.
- **Finish.** Race day, briefing, the start line. The commitment confirms itself.
- **Level Up.** Runtime suggests the next finish line. Distance climbs the ladder. Identity compounds.

The product is designed so a runner who arrives for their first 5K can stay for their first marathon — without ever leaving the same coaching relationship.

## What Runtime is, mechanically

Runtime is two things glued into one product.

### The race calendar — the spine, and the funnel

A curated, hyper-local list of running events — Flanders first, then expanding. Each race carries the data that matters for training: date, distance, elevation profile, terrain (road / trail / cross), historical weather for the start window, course notes, organizer contact.

Sources:
- **Timing providers** (Chronorace, Njuko) — programmatic, reliable, organizer-sanctioned.
- **Federations** (VAL, KBAB) — official race lists.
- **Direct organizer self-submission** via a 60-second form — the long-term moat.

The calendar is free, SEO-friendly, and works as the wide top-of-funnel for the paid layer.

### The bound training plan — the paid product

A runner opens Runtime and answers a short intake: current fitness honestly (recent 5K or 10K time, weekly km), age bracket, what they want to do. They browse the curated calendar and pick a goal race — or describe what they're looking for and Runtime suggests three matches.

The moment a race is selected, the system generates an adaptive n-week plan: **base-building → build → peak → taper**, with workouts paced to their current fitness and the race's specific demands (the hill at km 7, the typical late-August heat, the 9am start time).

From that point on, Runtime does three things every day:
1. **Shows today's workout** — pace targets, duration, structure, why.
2. **Syncs from Strava** (and later Apple Watch / Garmin) to log what actually happened.
3. **Holds a short AI-driven conversation** once or twice a week — *"how did Saturday's long run feel?"* — and adjusts the upcoming week based on the answer.

Missed runs auto-rebalance. Heat waves swap tempo for easy. Injuries or vacation trigger a recovery week. The night before race day, a personalized briefing arrives with pacing strategy, course notes, and what to wear given the forecast.

### The technical wedge: deterministic + AI

Under the hood, the **plan logic is deterministic** — periodization rules, 80/20 easy/hard, weekly volume capped at 10% growth, taper protocols pulled from established coaching practice. This is what keeps runtime safe and predictable: it will never hallucinate a brutal interval session or a 40 km long run for someone who ran 7 km last Saturday.

The **interaction layer is AI** (Claude). It makes the experience feel like a thoughtful coach instead of a spreadsheet — natural-language check-ins, judgment calls about how to adapt when the user reports fatigue, contextually appropriate encouragement in the user's language.

That hybrid — rules engine underneath, AI on top — is the technical posture. AI is the conversation; AI is *not* the source of truth for what to run.

### What's deliberately not in Runtime

- Not a social network. Strava already wins there.
- Not a generic fitness platform. Running only.
- Not a "talk to your data" product. The conversation is bounded to coaching context.
- Not free-tier coaching. The plan is the paid layer; freeloading on the calendar is fine and expected.

## The approach

**Validate before building.** Before any app code, run a 12-week Wizard-of-Oz pilot with 20 Flemish runners — manual coaching via WhatsApp + Google Sheets, manually curated race options, real human (me or my dietist) playing the role of the AI. The goal: prove (a) people stick with a goal-bound plan, (b) the coaching loop produces measurable gains, (c) we understand the failure modes *before* encoding them in software. Recruiting via the waiting-list landing, word of mouth, and local running clubs.

**Build globally from day one.** The MVP (post-pilot) is Flutter probably, Supabase EU, Stripe — with **locale as a first-class field on every entity**, a **timing-provider adapter pattern** (Chronorace today, OpenTrack or RunSignup tomorrow), **multilingual AI prompting**, and a **brand voice spec per market**. Each new country becomes a configuration exercise, not a rebuild. No Flemish-only assumptions baked into the data model, the copy, or the AI prompts.

**Sequence the rollout deliberately.** Flanders (depth, defensibility, native market) → BENELUX → France → Germany / UK. Each market built on the same playbook: lock in the local timing provider, build relationships with the top 20 race organizers, hand-curate the first 100 races, open the self-submission funnel, recruit the first paid cohort.

## Business model

**Freemium.**

- **Free:** the race calendar + a one-shot "pick a race for me" advisor. Wide funnel, SEO-friendly, captures emails.
- **Paid (~€5/mo or €40/yr):** the bound training plan, adaptive coaching, watch integration, race-day briefings.

**Secondary revenue:** affiliate referral from race signups via Chronorace / Njuko, and modest organizer-paid featured listings (clearly labeled, never replacing organic ranking).

## The wedge and the ambition


**The Flandrien ethic.** Belgian — and to a lesser extent Dutch — endurance culture inherits the Flandrien archetype: the cyclist who shows up in any weather, helps the rider next to him over the kasseien, and doesn't make a fuss about it. It's not a competition culture. It's a *finishing* culture. The discipline is the point and the celebration is muted. *Doen, niet zagen.*

Anglo-Saxon visitors notice the difference immediately: *you give each other chances to improve here, where we'd be competing*. That's the cultural insight in plain language. The English-speaking running app assumes competition is the engine — beat your PR, climb the leaderboard, here's your training stress score. Runtime assumes finishing is the engine. *Het werk is gedaan. Geloof het maar.*

That cultural distinction is the actual wedge — not a tone preference, a positioning. No current running app is built for the runner who finds the genre's performance culture embarrassing. Runtime is.

**Why the Flandrien anchor travels.** Most regional cultures don't export. Flandrien-ness does, because professional cycling exported it. A French cycling fan knows what a Flandrien is. So does a Brit, an Italian, a Japanese cycling fan. The value system — discipline as the point, finishing as the celebration, helping the rider next to you — is already legible internationally. The wedge is local in execution and recognisable in spirit, which is the right shape for a brand that wants to start in Flanders and end up global.

**The audience: anti-hype runners across generations.** The Flandrien posture is not age-coded. It runs in two demographic anchors:

- **The 40–65 loopclub member.** The provincial-jogging veteran, the stadsloop regular, the one for whom *doen, niet zagen* is a complete sentence. Currently underserved by Strava-acquired Runna and the English-first cohort. They want a coach who speaks their language, knows their races, and doesn't hype at them.
- **The 14–25 anti-hype starter.** The committed young runner who has had it with Goggins, hustle culture, and the suffering-as-content school of training. They want to run seriously — first 10K in six weeks, marathon as the goal — but they refuse the dominant cultural script that says they have to perform their training online to deserve the title of runner. They are Flandrien-shaped without knowing the word for it. They are also currently underserved: the only apps built for "young + serious" are built around the very performance culture they're rejecting.

Both segments share the same underlying refusal of the genre's hype layer. Age is a texture; the cultural posture is the constant. Runtime is built for both, in the same voice, with the same product. A 14-year-old training for his first 10K and a 58-year-old training for his twentieth stadsloop are recognisably in the same culture — and the brand should be the place that confirms it.

This is also a generational hedge against the brand reading as "for older men." Flandrien culture spans generations in Flanders — a koers fan at fourteen and one at sixty are in the same conversation. The brand inherits that span.

**Ambition.** Global. The Flemish launch is the wedge; the destination is a globally-distributed coaching platform serving recreational runners in every market with a meaningful local race ecosystem. Architecture, AI prompting, and brand voice are spec'd locale-aware from day one precisely because the global path needs to stay open. Implied trajectory: pilot → MVP → seed round in the €500K–€2M range → multi-market expansion.

The Flandrien ethic travels with the brand. Every new market gets its own local texture (Dutch directness, German precision, French rigour, the British understatement of a parkrun), but the underlying refusal of the genre's hype layer — the *finishing-as-the-celebration* posture — is the constant. The Flandrien is the spirit; the local culture is the accent.

## Why it's defensible

Generic competitors can copy the AI. They cannot easily copy the **curated relationship with local race organizers** — that's earned over time by being the platform organizers *want* to be in. The supply-side moat per country is the real defense; the AI layer is table stakes within 18 months.

Three concentric defenses:
1. **Hyper-local race data per market** — built race by race, organizer by organizer. Slow to acquire, slow to copy.
2. **Native-language coaching voice per market** — a Flemish runner doesn't want an English app translated; they want one that sounds like their club. Hard to fake convincingly at scale.
3. **The bound plan as structural retention** — once a runner is mid-cycle for an A-race, switching apps costs them their plan continuity. Retention is structural, not engagement-tricked.

## Competitive context

Strava acquired Runna in March 2025 for ~$130M — generic, race-agnostic training plans are now table stakes inside a social platform. The **race-bound, per-country-local** niche is structurally open: too small per market for the global incumbents to chase, too operationally heavy (organizer relationships, local curation) for a thin AI-only competitor to muscle in on.
