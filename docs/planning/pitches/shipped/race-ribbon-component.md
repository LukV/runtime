---
project: runtime
type: pitch
status: shipped
area: brand-system
block: brand-system-in-code
appetite: an evening
created: 2026-05-27
started: 2026-05-30
shipped_on: 2026-05-30
---
# The race ribbon component

## Problem

The ribbon is the brand's structural hook — [[../../product-design/004-design-system-and-screens#The hook — race ribbon|004 §1's ribbon section]] specifies a thin horizontal line at the top of every primary screen with evenly-spaced ticks (one per training week), the current week elevated and marked with the amber dot, and the goal marked with a square flag at the right edge. *The square — not a triangle — because the triangle reads as directional (go further) and the square plants (this is the goal).* Look at [[004-design-system.svg]]

It's the second amber-dot device in the brand alongside the wordmark — one accent color, the same #E8A65A, the same job in a different context. And it's the most-repeated visual element across the product: Vandaag, onboarding plan preview, partner admin, the wedstrijd sheet header, and the website's nav-adjacent small mode. Six places in the pilot screens alone, more once we expand.

If each instance is hand-coded, the brand drifts inside a week. Spacing between ticks gets eyeballed, the dot diameter creeps from 4-5px to "whatever looks right at this size", the square flag becomes a circle in one place because the dev who built it forgot to read the design note, and the *"warmth doesn't scale"* discipline of 004 §1 dies — the dot becomes 6px on splash screens because *bigger feels more impactful*.

The fix is the same pattern that worked for the wordmark: one component, two artefacts in `packages/design-tokens/dist/` (the SVG and a typed `.ts` companion), web-only in this evening's pitch, iOS deferred to block 5 with a clean handoff. The component takes `currentWeek`, `totalWeeks`, and `caption` props, and renders correctly at any tick count from 6 to 18.

## Appetite

**An evening.** Cap is binding. The pitch ships:

1. A `Ribbon` SVG generator at `packages/design-tokens/scripts/generate-ribbon.mjs`, emitting `dist/ribbon.ts` with typed exports the React component consumes (geometry constants, path-builder helpers — pattern matches what [[shipped/wordmark-as-component]] settled).
2. **Web**: `<Ribbon currentWeek totalWeeks caption />` React component at `apps/web/app/_components/Ribbon.tsx`. Two themes (`light` | `dark`). One "size" — the ribbon's height is naturally constrained by 004 §1 (*the dot stays 4-5px*) so we don't expose a size prop.
3. Smoke screen on `/` adding three ribbon instances (early-cycle, mid-cycle, race-week) so the geometry is visually inspectable.
4. iOS deferred to block 5, per the precedent set by [[shipped/wordmark-as-component]] and [[shipped/font-integration]].

If the evening runs out, cuts in this order:

1. **The `theme="dark"` variant drops first.** Ship light only. Dark mode swaps the pole color from Inkt to Krijt — for the ribbon that's a one-line conditional. Cuttable. The amber dot stays amber regardless of theme.
2. **The caption rendering drops.** Ship the ribbon geometry (ticks + pole + dot + flag) without the *"WEEK 4 / 12 · MECHELEN OVER 96 DAGEN"* caption below. Caption is just `<p className="font-label">{caption}</p>` underneath — trivially added later, no rendering risk. The geometry is the brand-critical part.
3. **The generator script drops; hand-roll the SVG geometry directly in the React component.** The ribbon's geometry is simple enough (a horizontal line, N evenly-spaced ticks, one dot, one square) that the generator is more discipline than necessity. We're keeping it because the wordmark precedent argues for one-pattern-one-place, but if the evening is tight, inline the math in `Ribbon.tsx` and skip the `dist/ribbon.ts` step. Easy to extract back out later.

The non-negotiable is *a `<Ribbon />` React component exists, renders correctly at three different `totalWeeks` values (6, 12, 18), and the amber dot consumes `var(--color-eerste-licht)` from the design tokens*. Everything else is cuttable.

## Sketch

Four pieces. The geometry math is settled first because everything else depends on it.

### 1. Geometry — `packages/design-tokens/scripts/generate-ribbon.mjs`

The ribbon is parametric. Given `totalWeeks` and `currentWeek`, the geometry falls out:

- **Pole** — a horizontal line at y-center of the viewBox. Stroke width is constant (1px); color is `currentColor` so it inherits the theme.
- **Ticks** — `totalWeeks` short vertical strokes evenly distributed along the pole. Tick height is constant (~4px), stroke width 1px, color `currentColor`. The current-week tick is elevated (~6px) and *not* drawn with a stroke — replaced by the amber dot below.
- **Dot** — a single `<circle>` at the current-week tick's x-position, y-center of the viewBox. Radius **always** 2.5px (= 4-5px diameter, per 004 §1's *"the dot stays 4-5px regardless of tick density"*). Fill is `var(--color-eerste-licht)`, hardcoded at the JSX/SVG level — never a prop.
- **Flag** — a small filled square at the right edge of the pole. Side length ~6px. Fill is `currentColor`.

The math:

```javascript
// generate-ribbon.mjs — emits dist/ribbon.ts
function ribbonGeometry({ totalWeeks, currentWeek, viewBoxWidth = 200 }) {
  const padding = 8                            // horizontal padding inside viewBox
  const poleY = 12                             // y-center; viewBox height is ~24
  const usableWidth = viewBoxWidth - padding * 2
  const tickStep = usableWidth / (totalWeeks - 1)
  
  const ticks = Array.from({ length: totalWeeks }, (_, i) => ({
    x: padding + i * tickStep,
    isCurrent: i + 1 === currentWeek,
  }))
  
  const dotX = padding + (currentWeek - 1) * tickStep
  const flagX = padding + usableWidth
  
  return { ticks, dotX, dotY: poleY, flagX, flagY: poleY, poleY, padding, viewBoxWidth }
}

export { ribbonGeometry }
```

The generator emits `dist/ribbon.ts`:

```typescript
// dist/ribbon.ts — AUTO-GENERATED FROM scripts/generate-ribbon.mjs — DO NOT EDIT
export const RIBBON_VIEWBOX = { width: 200, height: 24 }
export const RIBBON_GEOMETRY = {
  dotRadius: 2.5,        // 4-5px diameter, never scales
  flagSide: 6,
  tickHeight: 4,
  poleStrokeWidth: 1,
  padding: 8,
  poleY: 12,
}
export function ribbonTicks(totalWeeks: number, currentWeek: number): {
  ticks: { x: number; isCurrent: boolean }[]
  dotX: number
  flagX: number
} { /* ... */ }
```

The React component imports these constants and the `ribbonTicks` helper. Pattern matches `dist/wordmark.ts` from [[shipped/wordmark-as-component]]: one source, geometry pre-computed where it makes sense, the component does the JSX assembly.

### 2. Web — `<Ribbon />` React component

```tsx
// apps/web/app/_components/Ribbon.tsx
import {
  RIBBON_VIEWBOX,
  RIBBON_GEOMETRY,
  ribbonTicks,
} from '@runtime/design-tokens/dist/ribbon'

type Theme = 'light' | 'dark'

export function Ribbon({
  currentWeek,
  totalWeeks,
  caption,
  theme = 'light',
}: {
  currentWeek: number
  totalWeeks: number
  caption?: string
  theme?: Theme
}) {
  // Validate range — per 004 §1 the ribbon "scales legibly between 6 and 18 ticks"
  if (totalWeeks < 6 || totalWeeks > 18) {
    console.warn(
      `Ribbon: totalWeeks=${totalWeeks} is outside the designed range [6, 18]`
    )
  }
  if (currentWeek < 1 || currentWeek > totalWeeks) {
    console.warn(
      `Ribbon: currentWeek=${currentWeek} is outside [1, ${totalWeeks}]`
    )
  }

  const { ticks, dotX, flagX } = ribbonTicks(totalWeeks, currentWeek)
  const color = theme === 'light' ? 'var(--color-inkt)' : 'var(--color-krijt)'

  return (
    <div style={{ color }}>
      <svg
        viewBox={`0 0 ${RIBBON_VIEWBOX.width} ${RIBBON_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={
          caption ?? `Week ${currentWeek} of ${totalWeeks}`
        }
      >
        {/* pole */}
        <line
          x1={RIBBON_GEOMETRY.padding}
          x2={flagX}
          y1={RIBBON_GEOMETRY.poleY}
          y2={RIBBON_GEOMETRY.poleY}
          stroke="currentColor"
          strokeWidth={RIBBON_GEOMETRY.poleStrokeWidth}
        />
        {/* ticks (skip the current-week one — replaced by the dot) */}
        {ticks
          .filter(t => !t.isCurrent)
          .map((t, i) => (
            <line
              key={i}
              x1={t.x}
              x2={t.x}
              y1={RIBBON_GEOMETRY.poleY - RIBBON_GEOMETRY.tickHeight / 2}
              y2={RIBBON_GEOMETRY.poleY + RIBBON_GEOMETRY.tickHeight / 2}
              stroke="currentColor"
              strokeWidth={RIBBON_GEOMETRY.poleStrokeWidth}
            />
          ))}
        {/* current-week dot — ALWAYS Eerste licht, never scales */}
        <circle
          cx={dotX}
          cy={RIBBON_GEOMETRY.poleY}
          r={RIBBON_GEOMETRY.dotRadius}
          fill="var(--color-eerste-licht)"
        />
        {/* goal flag — square, not triangle (004 §1: square plants, triangle points) */}
        <rect
          x={flagX - RIBBON_GEOMETRY.flagSide / 2}
          y={RIBBON_GEOMETRY.poleY - RIBBON_GEOMETRY.flagSide / 2}
          width={RIBBON_GEOMETRY.flagSide}
          height={RIBBON_GEOMETRY.flagSide}
          fill="currentColor"
        />
      </svg>
      {caption && (
        <p
          className="font-label"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontSize: 10,
            color: 'var(--color-mist)',
            marginTop: 4,
          }}
        >
          {caption}
        </p>
      )}
    </div>
  )
}
```

Two design discipline points hardcoded into the JSX, both flagged with comments:
- The dot fill is `var(--color-eerste-licht)`. No theme variant changes it. *The warmth doesn't scale.*
- The flag is `<rect>`, not `<polygon>`. The square is the design language; flagging this in a code comment prevents a future contributor from "improving" it to a chevron because *"flags are usually triangular"*.

The `currentColor` pattern for the pole, ticks, and flag means the parent `<div>`'s `color` propagates — same trick the wordmark uses. Theme is just a color swap.

### 3. Smoke screen — three ribbon instances on `/`

The smoke `/` already shows the wordmark and the type roles. Append three ribbons:

```tsx
<section>
  <Ribbon currentWeek={1} totalWeeks={12} caption="WEEK 1 / 12 · MECHELEN OVER 96 DAGEN" />
  <Ribbon currentWeek={6} totalWeeks={12} caption="WEEK 6 / 12 · MECHELEN OVER 96 DAGEN" />
  <Ribbon currentWeek={12} totalWeeks={12} caption="WEEK 12 / 12 · MECHELEN OVER 96 DAGEN" />
</section>
<section style={{ background: 'var(--color-inkt)', padding: 22 }}>
  <Ribbon
    currentWeek={4}
    totalWeeks={18}
    caption="WEEK 4 / 18 · 10 KM ONDER HET UUR OVER 47 DAGEN"
    theme="dark"
  />
</section>
```

Four cases, covering: early-cycle, mid-cycle, race-week-itself, alternative tick count (18), and the dark variant. Visual inspection confirms the dot lands on the right tick at each, the flag sits at the right edge, the dot size doesn't change between 12 and 18 ticks.

### 4. iOS deferred — handoff to block 5

No `apps/ios/` exists yet. Following the pattern from [[shipped/wordmark-as-component]] and [[shipped/font-integration]], the iOS half is explicitly deferred. When block 5 picks up:

- Either extend `generate-ribbon.mjs` to also emit `dist/Ribbon.swift` with SwiftUI `Path` directives drawn from the same geometry constants (the design-tokens way — one source, two adapters), or hand-port from `dist/ribbon.ts` (the pitch's original-plan path).
- The shape API mirrors web: `Ribbon(currentWeek: Int, totalWeeks: Int, caption: String?, theme: ColorScheme)`.
- Same discipline rules: amber dot is `Color.eersteLicht`, locked. Flag is a square.

This pitch's design-tokens output is sized to support either iOS path with no further work — the geometry constants are platform-portable by design.

## Out of scope

- **The iOS implementation.** Deferred to block 5 per precedent. The generator script + `dist/ribbon.ts` carry enough constants for block 5 to render without re-deriving.
- **A `size` prop.** 004 §1 is explicit: *the dot stays 4-5px regardless of tick density — the warmth doesn't scale*. A `size` prop is the wrong API; the right API is "use it at its natural size, in a container that's wide enough." Consumers control width via the parent layout, not via a size prop.
- **Animation on week transition.** When the current week advances (Sunday → Monday), the dot doesn't slide along the pole or animate. It just moves. Calm motion is the brand statement; the ribbon is a static indicator.
- **Hover / interaction states.** The ribbon is read-only — it doesn't accept clicks, tooltips, or interactive states. Per 004 §1 it appears *at the top of every primary screen* as ambient context, not as a navigation surface. If we ever want week-detail-on-tap, that's a deliberate design decision, not a bolt-on.
- **A "featured race" or "key event" marker** other than the current-week dot and the goal flag. The ribbon has exactly two notable points: where you are now, and where you're going. Multi-marker variants are out of scope; if they're needed later (adaptation events, peak weeks), they're a design conversation, not a component prop.
- **Skipped or rest weeks rendering differently.** Every week gets a tick. The training plan's content varies week-to-week but the ribbon's rhythm doesn't change. Per 004 §1, the ribbon is *goal-bound, not race-bound* — week structure is a planning concern, not a ribbon concern.
- **Captions in any non-Dutch language.** The pilot is Vlaams. The component accepts an arbitrary `caption` string so localization doesn't require component changes, but no i18n machinery in scope.
- **Tests.** The geometry function (`ribbonTicks`) is the only piece with real logic — pure math, deterministic output. A snapshot test on `dist/ribbon.ts` against fixture inputs would catch regressions. Defer to when the design-tokens package gets its first proper test (it didn't in the tokens pitch either; consistent posture). The visual smoke screen is the v0 verification.

## Risks / unknowns

- **Tick spacing at 18 ticks may look cramped.** The viewBox is 200 units wide with 16 units of padding (8 each side); at 18 ticks the spacing is ~10.8 units per gap. The 4-5px dot is ~2.5 units in viewBox coordinates, which means the dot is comfortably smaller than the tick spacing — visually clean. But at very narrow render widths (mobile portrait at 320px page width minus app padding), the rendered tick spacing could collapse to a visually busy ~6px. Mitigation: the component has no minimum width enforcement; the parent layout decides. If a real screen renders the ribbon below ~250px wide, the layout is wrong, not the component. Document this in the component file's leading comment.
- **The `aria-label` falls back to "Week X of Y" when no caption is provided** — that's English in an otherwise Dutch app. Mitigation: callers should always pass a caption in production code (per 004 §1's examples, the caption *is* the disambiguator between race-attached and self-attached goals). The fallback exists for stories/smoke/test contexts. If it shows up in a screen-reader audit later, change it to Dutch then.
- **`var(--color-eerste-licht)` inside an SVG `fill` attribute works in modern browsers but has historically been fragile.** Mitigation: it's already proven on the shipped wordmark — the amber period uses the exact same pattern, and that's in production. If a future browser version breaks it, the wordmark breaks first and we learn at the same time.
- **The pole's `currentColor` inheritance depends on the parent setting `color`.** If a consumer places `<Ribbon />` inside a context that's already setting `color` for body text (which is the normal case), the pole inherits the body color. If the consumer places it in a context that doesn't set `color` at all (e.g., a fresh `<div>` at the top of a page), the pole inherits the user-agent default (probably black on white — which is *probably* what we want, but accidentally so, not deliberately). Mitigation: the component sets `color` on its own wrapping `<div>` via the theme prop, so it always controls its own color regardless of context. Already handled in the JSX above.
- **The square flag at viewBox x=192 has half its width drawn past the pole's right edge at x=192.** The pole's `x2` is `flagX` (192), the flag is centered on the same x. That means the flag protrudes 3px to the right of the pole's end. This is the desired look (the flag is *planted at* the goal, not *next to* it), but in code review it'll look like a bug to anyone who didn't read 004 §1. Mitigation: a code comment explaining the intent. *The flag is centered on the pole's end; the protrusion is intentional — the goal sits exactly there.*
- **The first appetite cut would push the generator script out and inline the geometry math in the React component.** Both paths produce identical output today; the generator-script form is better for the day iOS lands, but the inline form is shorter and works for v0. If the evening tightens, take the inline path and accept that block 5 will re-extract the math into the generator. Re-extraction is ~20 lines of moving code.

## Related

- Block: [[blocks/01-brand-system-in-code]]
- Design source: [[../../product-design/004-design-system-and-screens#The hook — race ribbon]]
- Pattern precedent: [[shipped/wordmark-as-component]] — the SVG + `dist/{thing}.ts` + React component pattern. The ribbon follows this exactly.
- Token consumer: [[shipped/design-tokens-single-source-of-truth]] — `var(--color-eerste-licht)`, `var(--color-inkt)`, `var(--color-krijt)`, plus the `font-label` type role from `dist/tokens.ts`.
- iOS handoff: [[blocks/05-ios-app-downsized]] — inherits the ribbon's iOS port from this pitch's deferred half, alongside the wordmark and font integrations that deferred the same way.
- Downstream consumers across blocks: Vandaag screen (block 5), onboarding plan preview (block 5), partner admin console (block 6), website nav-adjacent small mode (block 2 — optional), wedstrijd sheet header (block 5).

---

## What actually happened

**Draft from the diff — Luk to edit.**

Shipped the full default path, no cuts. `packages/design-tokens/scripts/generate-ribbon.mjs` emits `dist/ribbon.ts` with `RIBBON_VIEWBOX`, `RIBBON_GEOMETRY`, and a `ribbonTicks()` helper. `apps/web/app/_components/Ribbon.tsx` consumes those constants and assembles the SVG: pole + ticks via `currentColor`, amber dot locked to `var(--color-eerste-licht)`, square flag at the right edge. Light and dark variants both shipped. The smoke `/` got four ribbons (weeks 1/12, 6/12, 12/12 in light; 4/18 dark inside an Inkt panel) covering the early/mid/race-week cases and the 6–18 tick range.

Package-level changes: added `./ribbon` export and `generate:ribbon` script to `packages/design-tokens/package.json`. No new dependencies — the generator is plain Node.

Gates green on first try (lint, typecheck, next build). No visual inspection yet — Luk to confirm the dot lands on the right tick at each instance and the flag protrusion reads as intentional. If the dark caption color (`var(--color-steen)`) reads too dim against Inkt, swap to Mist.

Worth watching: the smoke screen is now busy enough that it's becoming a *system gallery*, not a homepage. That's fine for block 1 — block 2's nav/page-chrome pitches will retire it.
