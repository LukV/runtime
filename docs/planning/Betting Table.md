---
project: runtime
type: planning-index
status: active
updated: 2026-05-27
---
# Betting Table

The index of blocks. Each block is a substantial area of work with its own dependencies, framings, and pitch list. Read [[_about]] for how the planning system works. Read [[Sequencing]] for what depends on what (the block numbers are also the order of execution). Read [[Released]] for the narrative release history. The current cycle is in [[In Cycle]].

The goal across these eight blocks: **a public launch in two months** — pilot intake live and accepting applications, race calendar shining as the SEO front door, the organizer submission portal live, and a downsized iOS app in the hands of the first cohort of 20 runners, operated WoZ behind the scenes by An.

Architecture and stack decisions live in [[../architecture/001-stack-decisions]].

## Blocks

| #  | Block | Status | Where the pitches live |
|----|-------|--------|------------------------|
| 1  | Brand System in Code | in progress (3 of 5 slots shipped) | [[blocks/01-brand-system-in-code]] |
| 2  | Website Foundation | not started | [[blocks/02-website-foundation]] |
| 3  | Race Calendar | not started | [[blocks/03-race-calendar]] |
| 4  | Pilot Intake | not started | [[blocks/04-pilot-intake]] |
| 5  | iOS App — Downsized | not started | [[blocks/05-ios-app-downsized]] |
| 6  | Coach Backend & WoZ Operation | not started | [[blocks/06-coach-backend-woz]] |
| 7  | Launch & Recruitment | not started | [[blocks/07-launch-and-recruitment]] |
| 8  | Organizer Submissions | not started | [[blocks/08-organizer-submissions]] |

## How a block is structured

Each block note carries:

- A **framing** — what this block is, why it matters, what "done enough" looks like.
- **Open design items** when relevant — points where the design hasn't settled (cross-referenced back to the design notes).
- **Pitches** — pitch-sized work units, each with an appetite hint and enough detail to act on.
- **Dependencies** — what this block needs from other blocks, and what other blocks need from this one.

A pitch on a block note is a **slot** until a corresponding note exists under `pitches/`. The slot says enough to recognise the work; the pitch note says enough to start it. Most slots will never need a full pitch note — they'll just get built directly when the slot's framing is sufficient.

## How to use this

1. The block numbers are the order. Start at 1, finish blocks in sequence — see [[Sequencing]] for why (and where parallel tracks open up).
2. Skim the block notes for the area you're working in.
3. When you start a pitch, set the pitch's frontmatter to `status: in-cycle`, add it to [[In Cycle]], and (if a repo exists for the area) update its `BACKLOG.md`.
4. When you finish, move the pitch note to `pitches/shipped/` with a `shipped_on:` date and a one-paragraph "what actually happened" at the bottom.

If a pitch slot stops being worth doing, strike it through on the block note with a one-line note on *why*. The dead pitches are part of the record.

## Open design items vs pitches

Design questions still in motion — the wordmark-as-SVG question, featured listings on the calendar, the race-day briefing screen, the race detail page, the organizer portal — are **not** pitches. They live as open items inside the relevant block (or back in [[../product-design/004-design-system-and-screens#8. Open questions surfaced this pass]]). A pitch can be *gated* on a design item landing; the design item itself is not a pitch.

Five-minute jobs are also not pitches — just do them.

## Working with Claude Code

Most pitches in this betting table are sized for one or two evening sessions with Claude Code. The pitch note frames the work; Claude executes inside the frame. If Claude wants to extend scope mid-cycle, the answer is almost always *defer it to the next pitch, finish this one*.

The block notes are the right place to send Claude when starting a new area — they carry the surrounding context (why this block exists, what it depends on, what's coming next) that no individual pitch repeats.

[[../architecture/001-stack-decisions]] is what Claude reads on day one to understand the tech choices without re-deriving them from the block notes.
