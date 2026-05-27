---
status: draft
date: 2026-05-26
tags:
  - design
  - design-system
project: runtime
---
# Runtime — Design System and PoC Screens

Downstream of [[001-product-vision]], [[002-design-brief]], and [[003-pilot-scope]]. This note is the visual-system record of the PoC design pass: the design system as locked, all hero screens as SVGs, and the website structure. If anything here contradicts the vision, brief, or scope, those win.

The work proceeds from the [[002-design-brief]] brand orientation — Flandrien ethic, pre-dawn calm, identity-before-proof, earned optimism — and applies the **`veld`-derived visual register** that emerged through iteration: sans-only UI, paper-cool ground, ink on chalk, veldgroen as the quiet third color, eerste-licht amber as the single accent.

## 1. The system

### Wordmark

The wordmark is `runtime.` set in **Source Serif 4 Medium**, 500 weight, −0.02em tracking. The serif lives only in the wordmark — everything else in the app is sans. The contrast between a literary mark and grounded UI is what gives the brand personality. Things 3 does it. Stripe does it. Klarna does it.

The period at the end is amber (`Eerste licht #E8A65A`) and is the brand device. It appears as:
- The period of the wordmark
- The current-week dot on the race ribbon
- The center mark of the app icon

One color, three jobs, all the same color of warmth.

**On font choice.** This pass originally specified Tiempos Text (Klim Type Foundry) + ABC Diatype (Dinamo) — both excellent paid families. Audited cost for the pilot: ~€1,000 across desktop + web licenses with the weights we need. Not worth it before the product has earned any revenue. Swapped to an open-source stack that carries 90% of the same register:

- **Source Serif 4** (Adobe, OFL) replaces Tiempos for the wordmark. Transitional, legible, magazine-grade. The period-as-brand-device works identically.
- **Inter** (Rasmus Andersson, OFL) replaces ABC Diatype for all UI type. Inter is the literal reference standard for Diatype-style neo-grotesque on screen — Vercel, Figma, GitHub, Mozilla, and Linear marketing use it. Tabular numerics, optical sizing, contextual alternates included.
- **JetBrains Mono** (JetBrains, OFL) stays unchanged for numerics.

All three live on Google Fonts. Free CDN, no licensing forms, no annual renewals, full commercial rights for the app, the website, App Store screenshots, t-shirts. Total typography cost: **€0**.

If Runtime reaches scale and the paid families become worth licensing, the swap path is clean — Source Serif → Tiempos and Inter → ABC Diatype are near-metric-compatible. Most layouts wouldn't need to change.

Two alternative serifs were considered and rejected during the audition: **Lora** (slightly too bookish, less editorial) and **Fraunces** (variable axes are tempting but the contemporary feel reads younger than the brand wants). Source Serif 4 is the lock.

### Type system

| Role | Face | Size · Weight |
|---|---|---|
| Wordmark | Source Serif 4 Medium | 26pt header / 38pt splash · 500 |
| Display | Inter Bold | 52–56pt · 700 · −4% tracking · two-tone |
| Body | Inter Regular | 17pt · 400 |
| Labels / caps | Inter Medium | 10–11pt · 500 · 0.15em letter-spacing |
| Numerics | JetBrains Mono Medium | 14–56pt · 500 · −4% tracking |

**One sans family, three weights, mono for numbers.** The discipline that distinguishes considered data design from cluttered data design is *typography over chart*.

The display headline uses a **two-tone treatment**: the noun in `Inkt`, the unit/qualifier in `Steen` (muted gray). *Tempo. 8 km.* — same weight, lower volume on the second line.

**Inter setup notes.** Enable `cv11` (single-storey `a`) for a cleaner Diatype-like character if preferred — taste-dependent, neither is wrong. Enable `tnum` (tabular numerics) for any data alignment outside the JetBrains Mono blocks. Inter ships with a variable axis; using the variable file in production gives us all weight gradations from a single file (~360kb gzipped).

### Color tokens

| Name | Hex | Job |
|---|---|---|
| `Veldgroen` | `#7B9D7A` | New growth. Quiet third. Primary CTA in dark mode. Adaptation-ahead indicator. |
| `Eerste licht` | `#E8A65A` | The dot. Once per screen. Never used as fill behind text. |
| `Inkt` | `#0D1014` | Text in light. Background in dark. Icon ground. |
| `Krijt` | `#F6F5F1` | Cool paper. Replaces the cream. Brighter, more morning. |
| `Mist` | `#6B7680` | Captions, secondary text, units after numbers. |
| `Stof` | `#EFEDE5` | Card surfaces in light mode. |
| `Nacht` | `#1B2531` | Card surfaces in dark mode. |
| `Steen` | `#8C8678` | Muted gray for the second tone in display headlines. |
| `Houtskool` | `#3A4A52` | Body text on light. |

**Discipline of one accent.** `Eerste licht` is the only accent in the app. It marks the ribbon dot, the wordmark period, and the app icon center. Never used as a button fill, never used behind text. The warmth never scales — the dot is always #E8A65A regardless of density or context.

### Spacing

`4 · 8 · 12 · 16 · 22 · 30 · 36 · 44` — the Stadsloop scale. Generous, paper-like, never cramped.

### Motion

Two principles:
- Transitions are 220ms ease-out, no bounce, no spring on layout
- One restrained tick (haptic on iOS) on workout completion

Calm motion is itself a brand statement.

### The hook — race ribbon

A thin horizontal line at the top of every primary screen with evenly-spaced ticks (one per training week), the current week elevated and marked with the amber dot, and the goal marked with a **square flag** at the right edge. The square — not a triangle — because the triangle reads as directional (*go further*) and the square plants (*this is the goal*).

The ribbon is goal-bound, not race-bound. The right-edge flag means *goal*, not *race*. A picked race is one kind of goal; a private distance/time target is another. The caption disambiguates:
- Race attached: *WEEK 4 / 12 · MECHELEN OVER 96 DAGEN*
- No race: *WEEK 4 / 12 · 10 KM ONDER HET UUR OVER 47 DAGEN*

The ribbon scales legibly between 6 and 18 ticks. The dot stays 4–5px regardless of tick density — the warmth doesn't scale.

The ribbon does **not** appear on pure-utility screens (settings, profile).

### App icon

The app icon is **one tick from the ribbon, taken out of the screen and put on the home screen**. Ink square, vertical white stroke (= the *vandaag* tick), amber dot at its center. Same shape, same color, same job as the ribbon's current-week marker.

![[004-design-system.svg]]

*Note: the SVGs in this note still reference `Tiempos Text` and `ABC Diatype` in their `font-family` declarations, with `Georgia` and `system-ui` as fallbacks. Production code should swap these to `Source Serif 4` and `Inter` respectively. The visual proportions hold either way — the system was designed around shape, not specific letterforms.*

## 2. Information architecture

Per [[003-pilot-scope#5. The IA, simplified for v1]] — three tabs plus modals for v1:

| Tab | Job | One-line explanation |
|---|---|---|
| **Vandaag** | The daily driver | What you do today |
| **Kalender** | Race list | What's coming up |
| **Coach** | Conversation | Where we talk |

Plus an onboarding modal (first run), a Wedstrijd sheet (from any calendar row), and a single gear icon top-right on Vandaag opening a settings sheet.

The Week view is reached by pull-down from Vandaag, not a separate tab. Wedstrijd is a sheet, not a tab.

## 3. The screens

### Vandaag — light mode

The daily driver. Wordmark top-left, date top-right. Ribbon below. Adaptation row only when adaptation fired *that morning*. Headline (two-tone, left-aligned) in the middle. Workout card (doelpas + opbouw) below it. Primary action pinned to bottom.

![[004-vandaag-light.svg]]

### Vandaag — dark mode (5:42 AM)

Same screen, different temperature. The runner getting up before sunrise. Veldgroen earns its keep here as the primary CTA — the morning color on grass.

![[004-vandaag-dark.svg]]

### Onboarding — welcome

The single most important copy moment in acquisition. *Beslissen is de eerste training.* — Tier 3 register from [[002-design-brief#The Dutch brand vocabulary]]. The line above the headline (the *— TIER 3 —* annotation) ships invisibly; the user sees only the headline and subhead.

![[004-onboarding-welcome.svg]]

### Onboarding — goal and race-attach

Two of the five intake steps. Goal is required. Race attachment is optional and the *"Geen wedstrijd, mijn doel volstaat"* card is visually equal to the race cards — first-class skip option.

![[004-onboarding-goal-race.svg]]

### Onboarding — the commitment moment

The single most important copy moment in the product. Lands once. Two sentences. No fanfare.

![[004-onboarding-commitment.svg]]

### Adaptation states — three triggers

The screens that fire when the plan changes. One shape, three temperatures:
- **Veldgroen dot** — *Plan aangepast* (ahead of schedule)
- **Amber dot** — *Rustweek* (sick or injured)
- **Amber dot** — *Hitte* (weather)

`Was → wordt` is the discipline. Every change shown explicitly with the old struck through in mono.

![[004-adaptation-states.svg]]

### Wedstrijd sheet — with deep-link to inschrijving

Opens as iOS sheet at medium detent from any calendar row. Seven fields per [[003-pilot-scope#2.2]]. The new piece compared to the earlier draft: the **inschrijving status block** at the bottom. Two states: *NOG TE DOEN* (with the chronorace.be deep link in veldgroen) and *BEVESTIGD* (with start number and wave time).

The app's job is to know about the race and walk the runner to the door of the organizer. The transaction belongs to the organizer.

![[004-wedstrijd-sheet.svg]]

### Coach conversation

Chat surface. The coach has a name — *An*, the dietist for the WoZ pilot. After v1 the AI inherits the name. Continuity of relationship.

Three states: empty (*An kijkt mee.*), first message from coach, mid-conversation. Coach messages in `Stof` paper bubbles; runner messages in `Inkt` bubbles. Body type is the sans (Inter at 14pt) — quietly Swiss in a place most apps use a default-font message UI.

No quick replies, no voice notes, no chips, no attachments. Plain text both ways per [[003-pilot-scope#2.3]].

![[004-coach-conversation.svg]]

### Partner admin console — the coach's view

The dietist's web surface. Per [[003-pilot-scope#7.4]] this is a legibility test, not a designed product — the question it answers is whether the data model in the runner-facing app makes the partner surface tractable. It does.

One screen, three info zones: this week's plan, last 7 days of Strava activity, last three messages exchanged with the runner. *Plan aanpassen* is the one CTA that has to work. Everything else is read-only.

The runner list on the left is sorted to surface concerns to An — a runner with no activity in four days bubbles up via coral text and an amber dot. This is what makes her 12-week commitment tractable across 20 lopers: she sees them all in one column, knows in ten seconds who needs attention.

Cross-uses the same race ribbon component as the app — proves the design system isn't iOS-only by accident. Aesthetically dialed down: sans-serif throughout, no display type, no headline ceremony. The brand expresses itself by being *legible*, not by being styled.

![[004-partner-admin.svg]]

## 4. The website

`runtime.training` — the website **is** the calendar. SEO entry through hyper-local race searches (*"stadsloop mechelen 2026"*, *"joggings antwerpen augustus"*). The runner lands on a useful page. The app and the waitlist live *inside and around* the calendar, not above it.

Two CTAs threaded through the list, not stacked above it:
- **App nudge in ink** sits after the first few August races, with contextual copy that references the runner's likely goal (*"Stadsloop Mechelen heeft 96 dagen — net genoeg"*).
- **Pilot card in chalk** sits later in the list, after a few September races. Quieter, lighter, more "by the way." For the more invested visitor. Real scarcity: *14 / 20 plaatsen over*.
- **Waitlist as a quiet footer band** in ink. Not a hero section — just there for the person who's not ready to apply but wants to be notified.

Luk's intro is below the list, small, just three columns. He's not the hero — the calendar is.

Each race row eventually becomes its own URL (`runtime.training/wedstrijd/stadsloop-mechelen-2026`) with the same row content + a Wedstrijd sheet rendered as a full page. Province pages (`runtime.training/antwerpen`) and distance pages (`runtime.training/10km`) follow the same pattern. That's how SEO concentrates.

Page structure, top to bottom: nav (Source Serif wordmark + tab links + "Krijg de app" button), kalender H1 with the "100 wedstrijden" big-number stats, filter band (afstand + provincie chips), calendar list grouped by month with organizer notes per row and the highlighted current-runner race, app nudge mid-list (ink block with phone preview, contextual copy referencing 96 days to Mechelen), more calendar rows, pilot card mid-list (chalk block, *14 / 20 plaatsen over*), more rows, waitlist band (ink, quiet, with mail input), Luk strip (3-column credibility footnote), footer with the brand line *het werk is het feest*.

![[004-website-calendar-first.svg]]

## 5. Voice — confirmed strings

The lines that landed during this design pass, in priority order.

### The three-tier vocabulary (from brief §2)

- **Tier 1 conversion** — was *"Inschrijven is de eerste training."* Replaced by **"Beslissen is de eerste training."** — same shape, lower volume, race-agnostic. The Tier 1 line as it lives on the website is *"Een trainingsplan dat zich aanpast aan jouw week — en jouw doelwedstrijd."* (from [[003-pilot-scope#8]]).
- **Tier 2 brand line** — *"Het werk is het feest."* — footer of the website, t-shirt, the line that would be printed on the building.
- **Tier 3 loyalty line** — *"Finishen is genoeg."* — sticker, post-first-10K, the smallest and most personal.

### The commitment moment

`Je bent erbij. Vanaf nu ben je een loper.` — unchanged from brief §5.

### Vandaag (canonical)

- Tempo: `Tempo. 8 km.` / `Houd het comfortabel zwaar.`
- Duurloop: `Duurloop. 12 km.` / `Rustig. Je moet kunnen praten onderweg.`
- Lange duurloop: `Lange duurloop. 18 km.` / `Begin rustig. Eindig rustig.`
- Rust: `Vandaag rust.` / `Echt.`

### Adaptation (new in 004)

- Ahead: `Je loopt sterker dan verwacht.` / *"An scherpt de doelpas met 8 seconden."*
- Injured: `Een week op halve kracht.` / *"Niets is verloren. We pakken het rustig weer op."*
- Heat: `Vandaag geen tempo.` / *"Met de hitte mee, niet ertegen."*

The adaptation row on Vandaag, today-only: `Plan vanmorgen aangepast. Je liep zaterdag sterker.`

### Wedstrijd sheet (new in 004)

- Not registered: `Je doel staat. Voor de wedstrijd zelf moet je nog langs Chronorace.`
- CTA: `Inschrijven op chronorace.be ↗` (deep link to Safari)
- Footnote: `Opent in Safari · €14 inschrijfgeld`
- Registered: `Startnummer #1842 · Wave 9:00. Het werk loopt.`

### Coach (canonical)

- Empty state: `An kijkt mee.` / *"Eén of twee keer per week stelt ze een vraag. Hier praten jullie verder."*
- First message: *"Welkom. Ik volg je plan deze twaalf weken. Hoe was de eerste duurloop vandaag?"*

### Race-attach onboarding (revised in 004)

- Headline: `Wil je er een datum aan hangen?`
- Subhead: *"Een wedstrijd maakt het scherper."*
- Skip card: `Geen wedstrijd, mijn doel volstaat` / *"Het plan eindigt op een datum die jij kiest."*

### Website (new in 004)

- H1: `100 wedstrijden in Vlaanderen. De volgende zes maanden.`
- App nudge: `Kies een wedstrijd. Krijg een plan tot eraan toe.` / *"Stadsloop Mechelen heeft 96 dagen — net genoeg."*
- Pilot card: `Wij coachen je gratis tot aan de finish.` / *"12 weken hands-on coaching. Een echte coach. Een echt plan."*
- Waitlist: `Nog niet klaar voor 12 weken? Schrijf je in voor de lancering.` / *"Eén mail per kwartaal, hooguit. Geen launch-hype."*

## 6. What this PoC pass produced

- A locked design system: wordmark, app icon at every size, color tokens, type system, ribbon spec
- Vandaag in light and dark mode with the today-only adaptation row
- Onboarding flow (8 screens), with the welcome line, goal screen, race-attach screen, and commitment moment fully designed
- Three adaptation states (ahead, injured, heat) — making the brief's *"the plan adapts"* claim physical
- Wedstrijd sheet with the deep-link inschrijving pattern (two states)
- Coach conversation in three states
- Partner admin console — legibility test (per [[003-pilot-scope#7.4]])
- Website at `runtime.training` — calendar-first, with threaded app and pilot CTAs
- An open-source type stack (Source Serif 4 + Inter + JetBrains Mono) at €0 — paid-family swap path preserved for post-revenue

## 7. What's still open

1. **Font integration.** Add Source Serif 4, Inter, and JetBrains Mono to the project. For web: Google Fonts CDN or self-hosted woff2. For iOS: bundle Inter Variable and JetBrains Mono with the app, register them in `Info.plist`. Source Serif 4 is wordmark-only — could be inlined as SVG paths in the app icon and header to avoid the font dependency entirely (cheaper at load time, also makes the wordmark theming bulletproof).
2. **Wedstrijd individual page** at `runtime.training/wedstrijd/<slug>` — the SEO landing page version of the in-app sheet. Own session.
3. **Pilot intake form** as its own page (Typeform-style one-question-at-a-time or single-page scroll) — referenced in 003 but not designed.
4. **Organizer self-submission form** — 60-second form per [[001-product-vision]], the long-term moat.
5. **Inschrijving status detection.** Without Chronorace API in v1, the runner manually marks themselves registered. The return-to-app micro-interaction needs a sketch.
6. **Week view** (pull-down from Vandaag) — the 7-day list with the ribbon at the top. Not yet designed.
7. **Race-day briefing** — per brief §5 the moment the brand has the most permission to express itself. Own session.
8. **Post-race level-up flow** — three screens, fully copy-spec'd in brief §5, not yet visualized.
9. **AI conversation surface for v2** — once the WoZ pilot has produced the corpus.

## 8. Open questions surfaced this pass

1. **The race anchor block on Vandaag is gone.** *"I want to glance at my race anchor"* is now a deliberate tap into the Wedstrijd sheet rather than ambient on the daily-driver. Probably right — the ribbon caption (`MECHELEN OVER 96 DAGEN`) does the job — but if it ever feels missing, the answer is probably a long-press on the ribbon caption that expands the race detail inline, not putting the block back.
2. **The mid-list phone preview in the website.** I included a small Vandaag rendering inside the app nudge band. Heavy but anchoring. Alternative: just headline + CTAs, leaning on running visual context.
3. **Featured listings** as secondary revenue per [[001-product-vision]]. Pattern probably: small *"Aanbevolen"* pill in row corner, soft chalk background, no rank bump. Not surfaced this pass.
4. **Strava-clubs / Loopgroepen** as a partner pattern. *"Voor clubs"* removed from this pass per direction. Worth revisiting when the loopclub recruitment channel from [[003-pilot-scope#8]] kicks in.
5. **Wordmark-as-SVG.** Hot-take worth flagging: since the wordmark is the only place Source Serif appears, we could export it as an SVG path and ship the app *without bundling Source Serif at all*. Saves ~80kb in the iOS bundle, makes the mark renderable at any size without font dependency, and the amber period becomes a separate `<circle>` element that's trivially themable. Worth a 30-minute experiment.

   **Resolved 2026-05-27 in [[../planning/pitches/shipped/font-integration|font-integration]]:** *yes, inline SVG on iOS; Source Serif 4 is not bundled in the app.* The web keeps Source Serif loaded (small file, cached) so the live-text fallback exists and the live wordmark is selectable as text. The iOS wordmark renders entirely from an SVG path with the amber period as a separate `<circle>` per the discipline in §1. See [[../planning/pitches/shipped/wordmark-as-component|wordmark-as-component]] for the concrete component.
