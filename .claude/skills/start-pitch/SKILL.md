---
name: start-pitch
description: Move a pitch from ready to in-cycle. Updates the pitch frontmatter and the In Cycle.md "Currently" section. Use when Luk says "start <pitch-name>", "let's pick up <pitch-name>", or "I'll work on <pitch-name>", or when a pitch in docs/planning/pitches/<name>.md needs to move from status ready to status in-cycle.
---

# start-pitch

Move a pitch into the in-cycle state across the two places it needs to be updated.

## Paths

The planning system lives in the repo, not in an Obsidian vault.

- Pitch notes: `docs/planning/pitches/<name>.md`
- In Cycle: `docs/planning/In Cycle.md`
- Block notes: `docs/planning/blocks/`
- Architecture: `docs/architecture/001-stack-decisions.md`
- Design notes: `docs/product-design/001-product-vision.md` … `004-design-system-and-screens.md`

## Steps

1. **Identify the pitch.** If the name isn't obvious from Luk's request, list `docs/planning/pitches/` and ask. Don't guess.

2. **Read the pitch.** Confirm `status: ready` (or `status: draft` — if draft, ask whether the sketch and appetite are ready, or whether more shaping comes first).

3. **Update the pitch frontmatter.** Set `status: in-cycle`. Add `started: YYYY-MM-DD` (today; resolve via `date +%Y-%m-%d`). Keep `appetite`, `area`, `created` unchanged.

4. **Update `docs/planning/In Cycle.md` "Currently" section.** Replace the section body with:

   ```
   ## Currently in cycle

   ### [[pitches/<pitch-name>]] — appetite: <appetite>

   Started YYYY-MM-DD.

   <one-paragraph reminder of what this is and what "done" looks like — pulled from the pitch's Problem section, paraphrased>

   **Cap reached on:** *<date the appetite runs out — calculate from start + appetite>*
   ```

   The cap date is written down at the start and not adjusted later.

5. **Update the on-deck list in `In Cycle.md`.** If the pitch was listed on-deck, remove its line (it's now in-cycle, not next). Renumber remaining items.

6. **Confirm.** Report the updated places and the cap date. Ask whether to draft a starter commit (`chore: start <pitch-name> pitch`) or wait — Luk usually waits.

## Appetite-to-cap reckoning

Appetites are measured in **evenings + weekends**, not 40-hour weeks ([[../../../docs/planning/_about#Appetite, not estimates]]).

- "an evening" → today + 1 day (cap = tomorrow end-of-day)
- "a weekend" → today + 2 days (Sat+Sun)
- "a week of evenings" → today + 7 calendar days
- "a fortnight of evenings" → today + 14 calendar days

Round up to a weekday end if the cap lands on a weekend.

## Don't

- Don't extend the appetite when writing the cap. The cap is binding.
- Don't move the pitch file. It stays in `docs/planning/pitches/` while in-cycle; only `ship-pitch` moves it.
- Don't update the block note. The pitch's slot already has the framing from when the pitch was drafted; the slot stays where it is.
- Don't `git add` or `git commit` without confirming — Luk may want to commit at a different boundary.
- Don't invent scope from the pitch. If something looks needed but isn't in the pitch, raise it and ask whether to extend, defer, or drop.
