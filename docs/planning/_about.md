---
project: runtime
type: planning-system
status: active
updated: 2026-05-26
---
# About this folder

The implementation plan for Runtime. **Self-contained.** Anything that's been promised in [[../product-design/001-product-vision]], [[../product-design/002-design-brief]], [[../product-design/003-pilot-scope]], or [[../product-design/004-design-system-and-screens]] but isn't yet built lives here as a pitch or a slot on a block.

Architecture and tech stack decisions are documented separately in [[../architecture/001-stack-decisions]]. Read that first if you're starting fresh — it explains *what* we're building with, before this folder explains *what we're building, in what order*.

Modeled after the [[../../../lumen/docs/planning/_about|Lumen planning surface]] — Shape Up with appetites, blocks as the top navigation, pitch lifecycle, no fixed cycles.

## Files

- [[Betting Table]] — index of blocks. The top-level navigation.
- [[Released]] — narrative release history. The repo's `CHANGELOG.md` is the semver shipping log; Released is what each release was *for*.
- [[Sequencing]] — block-order argument. Block numbers (1→8) are the sequence; this file explains where parallel tracks open up.
- [[In Cycle]] — what's being built right now. Usually one pitch.
- `blocks/` — one note per block. Each block carries its framing, open design items, pitches, and dependencies.
- `pitches/` — one note per pitch that's been written up. `_template.md` is the starting point. Most slots on a block note never need a full pitch file — the slot framing is enough.

## What's a pitch, what's not

A **pitch** is implementation work that benefits from being framed before being done. Problem, appetite, sketch, out-of-scope, risks. Sized so one person can hold the whole shape in their head and ship something coherent inside the appetite.

A pitch is **not**:

- A design decision still in motion. Those go back into the product-design notes (`001`–`004`) or get logged as open questions inside the relevant block.
- A five-minute job (typo fix, copy tweak, color adjustment). Just do them.
- A "feature idea" with no concrete shape. Either frame it as a pitch or leave it as an open design item.
- An architecture decision. Those live in [[../architecture/001-stack-decisions]].

## Pitch lifecycle

1. **Slot on a block note.** One line under a block. Not a pitch yet — a placeholder for one.
2. **Draft.** A note in `pitches/` with `status: draft`. Problem and rough appetite captured.
3. **Ready.** `status: ready`, linked from the block. Sketch concrete enough to start tomorrow.
4. **In cycle.** `status: in-cycle`. Listed on [[In Cycle]].
5. **Shipped.** `status: shipped`, moved to `pitches/shipped/`. `shipped_on:` date and one-paragraph "what actually happened".
6. **Dropped.** `status: dropped`. Stays in `pitches/` with a note on *why*.

Many slots will never need a full pitch note — the block-level framing carries enough. Write the pitch note when:

- The slot's framing isn't enough to start.
- More than one person needs to understand the shape (Luk + Claude Code at minimum).
- The risks deserve explicit calling-out.

## Appetite, not estimates

Each pitch declares an **appetite** — a cap on evening-time and attention. "An evening." "A weekend." "A week of evenings." "A fortnight of evenings." If work overflows the cap, the response is to cut scope or drop the pitch — never to extend the cap silently.

Runtime is being built **evenings + weekends** through summer. Appetites should reflect that — *"a week"* means *a week of evenings*, not 40 hours.

There's no fixed cycle length. A new pitch starts when the previous one ends.

## What lives where

- **The why** — design notes ([[../product-design/001-product-vision]] through `004-design-system-and-screens`).
- **The how (stack-level)** — [[../architecture/001-stack-decisions]].
- **The strategy and the work** — this folder.
- **The how (pitch-level)** — figured out during the cycle, captured in commit messages and (if worth keeping) a session note.
- **The when** — the appetite.
- **The visual system** — [[../product-design/004-design-system-and-screens]], not duplicated here.

## Working with Claude Code

Pitches are framed for Claude Code to execute. The pitch note tells Claude what's in scope and what's not; the appetite tells Claude when to stop and ask rather than charging ahead.

When starting a pitch, point Claude at:
1. [[../architecture/001-stack-decisions]] — the stack and the *why*.
2. The pitch note itself.
3. The block note (for surrounding context).
4. The relevant product-design note(s).

Claude should not invent scope. If something looks needed but isn't in the pitch, raise it and ask whether to extend the pitch, defer it to another slot, or drop it.

## When in doubt

If something doesn't fit a pitch — a copy tweak, a small SEO sweep, a one-line bug fix — just do it. Pitches are for work that earns being framed first. If something *would* be a pitch but the design isn't settled yet, push it back to the design notes.
