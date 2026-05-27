---
status: draft
date: 2026-05-26
tags:
  - design
project: runtime
---
# Runtime — Design Brief

This brief is downstream of [[001-product-vision]]. It is the brand and design expression of the insight stated there: *you become a runner the moment you commit, not when you finish.* If anything in this brief contradicts that insight, the insight wins and the brief is wrong.

## 1. Brand orientation

### What Runtime embodies


**Flandrien ethic.** Belgian endurance culture inherits the Flandrien — the cyclist who shows up in any weather, helps the rider next to him over the kasseien, and doesn't make a fuss about it. Finishing is the celebration. Discipline is the point. *Doen, niet zagen.* This is the value spine of the brand, exportable internationally because cycling already exported it. Every other line in this section is a texture of it.

**Running enters reality.** In software, runtime is when code stops being theory and starts executing. In running, runtime begins the moment you commit to a race. You don't become a runner at the finish line. Your running life enters runtime when you decide.

**Pre-dawn calm.** Runtime lives in the quiet hours: empty roads, first light, cold air, a nod from another runner. Not performance culture. Just the simple act of being out there.

**Earned optimism.** Calm, credible encouragement from a coach who respects the work. No hype, no gamification, no false praise. Progress is acknowledged because it happened.

**The race is real.** Every run points gently toward a real date, a real place, and a real start line. The race isn't pressure. It's purpose.

**Identity before proof.** The commitment comes first. The finish line doesn't grant the identity of runner — it confirms it.

**Flemish understatement.** Direct, grounded, and quietly confident. More loopclub than life coach. More consistency than motivation. The Flandrien ethic in conversational form: you helped the rider next to you over the kasseien; you don't talk about it afterwards.

**Calm density.** Data matters, but it serves the runner. Thoughtfully presented, never overwhelming. Closer to a well-designed magazine than a dashboard.

### What Runtime does not embody

- **Not gamified.** No streaks-as-primary-mechanic. No flames. No "you're crushing it." No mascot.
- **Not data-bro.** Not Strava. Not pace-curve worship. Not "training stress score" as the hero number.
- **Not wellness-pastel.** The Headspace/Calm aesthetic is too soft for this — these are runners, not meditators. There's grit in this audience.
- **Not corporate-fitness.** Nike Run Club's polished-stock-photo aesthetic reads as a brand asset, not a coach.
- **Not young-coded.** No neon, no "vibey" gradients, no Gen Z-adjacent illustration. The committed runner audience is the design target, full stop.

### Reference register

The brand sits in the space between:

- **Things 3** — for the discipline of native-feeling-but-distinctive, the restraint that reads as competence.
- **FastNed** — for confident-Dutch single-brand-color identity carrying a utility app.
- **Monocle** (the magazine, not the app) — for the literary-but-direct register, the typographic care of well-set data.
- **Teenage Engineering** — for the willingness to be a little weird in service of identity.

Explicit non-references: **Strava, Runna, Nike Run Club, Garmin Connect.** Useful as the "don't be this" benchmarks.

---

## 2. Brand essence and core belief

**Brand essence:** *Your running life enters runtime the moment you commit.*

**Core belief:** *You're already a runner.* Choose your next finish line. We'll help you prove it.

These two sentences are the test. Any piece of copy, any design moment, any product decision — if it contradicts either, it's wrong.

### The Dutch brand vocabulary

Three lines, three registers. They are saying the same thing at three different volumes. Together they form the brand's full vocabulary.

**`Inschrijven is de eerste training.`** — *the conversion line.*
Goes on the landing page above the signup form, in the App Store description, in the onboarding flow. Does the acquisition work because it makes the proposition self-explanatory: signing up is not a precondition to the work; it *is* the work. Anyone reading it understands what Runtime is for in under three seconds.

**`Het werk is het feest.`** — *the brand line.*
Goes on the t-shirt, the marketing site footer, the race-day briefing, a poster at a stadsloop. Does the cultural work — it states what the brand stands for, full stop. It dissolves the gap between training and racing. It is the Flandrien ethic compressed to four words and is the line that would be printed on the building if there were a building.

**`Finishen is genoeg.`** — *the loyalty line.*
Goes on a sticker, the inside of a finisher's medal box, the post-race message after the first 10K. Does the retention work — it's what a loyal user repeats to themselves in week 8 when the training is hard and the doubt arrives. The smallest of the three lines and the most personal.

The discipline: never use two of the three lines in the same surface. They are not a chorus; they are three different conversations the brand has with three different audiences at three different moments. The conversion line speaks to the not-yet-user. The brand line speaks to the world. The loyalty line speaks to the runner alone, in the moment they need it.

---

## 3. The wordmark

The mark is the word `runtime.` Somewhere around the wordmark sits a small amber dot positioned where the sun would be at first light. The wordmark sits *below its own horizon*.

The brand mark is the wordmark and the rising-sun period together as one unit. The same device appears at every screen header, scaled down to 26pt.

### Domain and namespace

- Primary: **runtime.training** (the product)
- App store name: **Runtime**
- Bundle ID convention: `run.Runtime.app`

---

## 4. The hook

Every screen carries **the race ribbon**: a thin horizontal line at the top of the screen with 12 evenly-spaced ticks (one per training week), the current week elevated and marked with the Eerste-licht amber dot, and the race itself marked with a flag tick at the right edge.

The ribbon does three things at once:

1. Tells the user where they are in the 12-week buildup.
2. Carries the brand's thesis — *every workout points at a real date* — as a permanent visual element.
3. Visually echoes the markers along a Runtimeloop course, reinforcing the cultural anchor.

The ribbon is non-optional. It appears on the Today screen, the Week view, the Race detail, and the Workout detail. It does *not* appear in pure-utility screens (settings, profile, account) — those use just the wordmark.

The amber dot has one job and one job only: marking the user's current position in the program. It does not pulse, animate, or change color. It is a small piece of warmth at the top of every screen, doing its work quietly.

---

## 5. Voice and copy

### Voice principles

- **Calm coach.** Never grappig op zoek naar grappig. Never reaching.
- **Flat-honest by default.** Most screens have *no* humor. The humor lives only in emotional moments (missed workouts, race week, recovery) where dry honesty produces something accidentally true.
- **Direct.** No exclamation marks. No emoji. No "Let's go!" No "You got this!"
- **Dutch first.** All copy in Dutch (Flemish register). English is a future port, not a default.
- **Second person, du-not-u.** *Houd je tred. Vandaag rustig. Het werk is gedaan.*
- **Length budget.**
    - Button labels: ≤3 words.
    - Empty states: one short sentence, optional second line.
    - Error messages: one sentence, blames the situation not the user.
    - Coach voice (subheads, briefings): one sentence, occasionally two.

### Voice samples — by context

#### Today


- **Headline:** `Tempo. 8 km.`
- **Subhead (coach voice):** `Het mag pijn doen. Houd het ritme.`
- **Primary action:** `Start de training`
- **Secondary:** `Verschuif naar morgen`

#### Easy run

- **Headline:** `Duurloop. 12 km.`
- **Subhead:** `Rustig. Je moet kunnen praten onderweg.`

#### Long run

- **Headline:** `Lange duurloop. 18 km.`
- **Subhead:** `Begin rustig. Eindig rustig.`

#### Rest day

- **Headline:** `Vandaag rust.`
- **Subhead:** `Echt.`

#### Missed workout (next morning)

- **Headline:** `Gisteren overgeslagen.`
- **Subhead:** `Geen drama. Vandaag rustig.`

#### Race week

- **Headline:** `Mechelen is zaterdag.`
- **Subhead:** `Het werk is gedaan. Geloof het maar.`

#### Race day briefing

- **Headline:** `Vandaag is de dag.`
- **Subhead:** `Begin trager dan je denkt. Geniet de laatste kilometer.`

#### Onboarding — empty state, no race selected

- **Headline:** `Kies je doel.`
- **Subhead:** `Het plan volgt.`

#### Workout complete (success state)


- **Headline:** `Klaar.`
- **Subhead:** `8,2 km · 4:36 gemiddeld. Het werk staat in de benen.`

#### Injury / recovery week trigger


- **Headline:** `Een week op halve kracht.`
- **Subhead:** `Niets is verloren. We pakken het rustig weer op.`

#### Race finish + 16 hours — the recognition moment

Triggered the morning after the race (roughly 16 hours after the recorded finish). One of the most important brand surfaces in the product.

- **Headline:** `Gisteren Mechelen.`
- **Subhead:** `Het werk staat achter je. Vandaag rust. Echt rust.`

No CTA. The screen does one thing. The race is named flatly in the past tense — *het werk staat achter je* mirrors *het werk staat in de benen* from the workout-complete state. The *Echt rust* call-back to the standard rest-day copy is deliberate: the runner will be tempted to do something today, and the brand insists, gently, that they don't.

#### Race finish + 3–4 days — the integration moment

Triggered when the runner opens the app for the first time after a 3+ day gap, or on day 4 post-race, whichever comes first.

- **Headline:** `Drie dagen stil.`
- **Subhead:** `De benen weten het nu. Je bent waar je vorig jaar nog niet was.`

The silence is named instead of explained away. *De benen weten het nu* is Flandrien-specific phrasing: the body has integrated the work, identity is now in the muscle rather than only in the app. *Je bent waar je vorig jaar nog niet was* is the compounding line — temporal comparison, not competitive. Still no CTA. The screen acknowledges; it does not direct.

#### Race finish + 10–14 days — the invitation moment

Triggered on day 10–14 post-race depending on re-engagement. This is the level-up moment.

- **Headline:** `Wat is de volgende?`
- **Subhead:** `Geen druk. Geen schema voor er een doel is.`
- **Primary content:** three suggestions, presented as peers, not as a ranked ladder:
    1. The same distance again, in a different season (the loyal-repeat path).
    2. The next distance up, with a realistic timeline (e.g. 10 miles in 14 weeks).
    3. A more ambitious option further out (e.g. half marathon in 18 weeks).
- **Secondary action:** `Nog niet kiezen.`

The question is open. *Wat is de volgende?* is a peer's question, asked over coffee — not a coach's question, asked at a desk. *Geen druk. Geen schema voor er een doel is.* makes the product's discipline explicit: Runtime will not train you abstractly. No goal, no plan. That is the line that protects the brand from becoming generic fitness.

The first suggestion — the *same distance again* — is non-negotiable. Not every runner levels up. Some runners run the same stadsloop ten years in a row, and Runtime respects that more than it respects the linear progression ladder. *Nog niet kiezen* is a real, dignified, non-punished button. Two words, no apology. A user who picks it and is genuinely respected by the app for doing so has just received the strongest possible signal that Runtime is the running app that doesn't optimise them.

### The moment-of-commitment copy

The moment someone picks a goal race, the app does not say "training plan created." It says:

> `Je bent erbij. Vanaf nu ben je een loper.`

This is the single most important piece of copy in the product. It is the place where the insight from [[001-product-vision#The insight]] meets the user directly, in their own language, at the only moment that matters.

### What Runtime never says

| Don't                    | Instead                               |
| ------------------------ | ------------------------------------- |
| *Welcome to Runtime!*    | *Klaar om te beginnen?*               |
| *You're crushing it! 🔥* | *Goed gedaan.*                        |
| *Day 4 of your journey*  | *Week 1 · dinsdag*                    |
| *Let's go!*              | *Start de training*                   |
| *Awesome workout!*       | *Klaar.*                              |
| *You smashed your goal!* | *Onder je doelpas. Mooi.*             |
| *Don't give up!*         | *(no copy — Runtime doesn't lecture)* |

---

## 6. Platform divergence

iOS and Android share everything except platform-native interaction patterns.

**Identical across platforms:** all type, color, spacing, motion, iconography, copy, the race ribbon, the wordmark.

**Diverges per platform:**

|              | iOS                                          | Android                               |
| ------------ | -------------------------------------------- | ------------------------------------- |
| Top chrome   | Large title, fades to inline on scroll       | Top app bar, scrolls with content     |
| Tab bar      | Bottom tab bar, translucent                  | Bottom navigation, Material elevation |
| Back gesture | Edge swipe + chevron                         | System back gesture + arrow           |
| Modals       | Sheets with detents (small / medium / large) | Bottom sheets with drag handle        |
| Share        | iOS share sheet                              | Android share intent                  |
| Haptics      | Rich (taptic patterns on completion)         | Limited (single confirmation tick)    |
| Long-press   | iOS context menu                             | Material long-press menu              |

If a design moment forces a divergence not covered above (e.g. a custom gesture), iOS gets first-class implementation; Android gets a thoughtful adaptation rather than a port.

---

## 7. Information architecture (preview)

This brief covers the design system and one hero screen (Today). The full app structure is sketched here for context; detailed screen designs are a separate exercise.

**Five primary surfaces:**

1. **Vandaag** — the daily-driver screen. Today's workout, the race ribbon, the race anchor. The screen you open every morning.
2. **Week** — the seven-day view. This week's workouts at a glance. Pull-down on Vandaag to reach it.
3. **Wedstrijd** — the race detail. Course profile, weather norms, pacing strategy, the briefing.
4. **Kalender** — the race calendar. Hyper-local, filterable. Where you discover and switch races.
5. **Profiel** — fitness inputs, integrations (Strava, Apple Watch), settings.

**Three less-frequent surfaces:**

- **Onboarding** (first run only)
- **AI conversation** (modal, reached from Vandaag once or twice a week)
- **Race-day briefing** (full-screen, the night before and morning of)

---

## 8. What's not covered in this brief


The following are acknowledged as design problems but not solved here:

- **Onboarding flow** — needs flow-first work. Six screens minimum, probably eight. The intake questions (recent 5K time, weekly km, age bracket) need careful copy. The commitment moment ("Je bent erbij. Vanaf nu ben je een loper.") sits at the end of this flow and is where the brief's voice work has to land hardest.
- **The AI conversation surface** — how the once-or-twice-a-week check-in actually looks and feels. Critical to the product thesis but its own design problem.
- **The race calendar** — the discovery surface. Likely needs filtering, search, and "pick a race for me" entry point.
- **The week view** — how seven days of workouts get presented without becoming a spreadsheet.
- **The race-day briefing** — the moment the brand has the most permission to express itself fully. Earns the single illustration exception.
- **Empty states beyond "no race"** — the full inventory.
- **Settings architecture** — the boring screens that still need to be Runtime.
- **App icon** — derived from the wordmark device but not designed yet.
- **Marketing site** at runtime.training — separate brand exercise.

The level-up moment (copy and structure for the three post-race screens) is solved in §5 of this brief.

Each of the remaining items should be addressed in its own flow-first or screen-first design session.

---

## 9. Open questions

Things the brief makes confident choices on but where the user might push back:

1. **The race ribbon at the top of every primary screen.** Is the visual weight right, or does it become wallpaper? Worth seeing in implementation.
2. **The amber dot's rarity.** Used once per screen as a discipline. The risk is it disappears entirely on some screens. The opposite risk is overuse dilutes it. Probably right; worth testing.
3. **No bottom tab bar shown in the Today mockup.** It will exist (five-tab structure above), just wasn't part of the hero screen exercise. Visual treatment to be designed.
4. **Dutch-only at launch.** Closes the door on non-Dutch-speaking users of Belgian races (about 40% of Flemish urban races have French or English participants). Probably right for v1; flag for v2.
5. **"Verschuif naar morgen" as a one-tap secondary action.** Easy to skip a workout. Might encourage exactly the dropoff the product is trying to prevent. Alternative: long-press on primary action, hiding it slightly.
6. **No streak counter, anywhere.** Deliberate. But streaks do work, even for adult audiences. Worth revisiting after v1.

---

## 10. Inspiration moodboard

Not for direct copying. For the model in the back of the head.

- The cover of *3 Feet High and Rising* (Native Tongues, the source of the naming register)
- A Flemish field in early November, 6am, mist on the lower meter
- The dashboard of an old Saab
- A Teenage Engineering OP-1
- A page from *Monocle* magazine — any feature spread
- The Things 3 inbox on iPhone
- A Brooks Glycerin shoe sole — the lugs, the pattern
- The start banner of any Flemish stadsloop — the typography, the sponsor logos, the chaos that's been there forever
