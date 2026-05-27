---
project: runtime
type: pitch
status: shipped
area: brand-system
block: brand-system-in-code
appetite: an evening
created: 2026-05-27
started: 2026-05-27
shipped_on: 2026-05-27
---
# The wordmark as a component

## Problem

The wordmark — `runtime.` in Source Serif 4 Medium with an amber period — is the brand's most-rendered surface and the first place inconsistency shows. It appears, by [[../../product-design/004-design-system-and-screens#1. The system|004 §1's]] count, in at least four contexts already on the books: the website header, the website splash, the iOS app's onboarding/welcome moment, and the loading state. It will appear in more places before the launch. Email signatures, App Store screenshots, the favicon, the partner admin login, the organizer portal, a future T-shirt.

If each of those is hand-typed or hand-drawn, three things drift:

1. **The tracking** (`−0.02em` is documented but won't be reapplied identically by hand).
2. **The amber period** — wrong shade, wrong size, wrong vertical alignment with the baseline. The whole *one accent, three jobs* discipline of 004 §1 gets compromised by one approximate `#E8A65A` in a SwiftUI `Text` view.
3. **The size relationships** — 004 §1 names 26pt for headers and 38pt for splash. A third size will appear within a month if there's no API forcing the picker to a discrete set.

The fix is a single component, one per platform, with the same API on both. Web gets `<Wordmark size="header|inline|splash" theme="light|dark" />`, iOS gets `Wordmark(size: .header, theme: .light)`. The rendering decision (SVG or live text) is settled inside the component; consumers don't care.

This pitch is the **first real consumer** of the design tokens and the fonts that the two sibling pitches in this block install. It earns its place by proving the upstream pitches actually work — if a real component can't render the wordmark from `--color-eerste-licht` and `--font-wordmark`, those tokens haven't shipped.

## Appetite

**An evening.** Cap is binding. The pitch ships:

1. **Web**: `<Wordmark />` React component in `apps/web/app/_components/Wordmark.tsx` (or wherever the web app's component convention lands). Three sizes, two themes. Implemented as inline SVG, no live-text branch.
2. **iOS**: `Wordmark` SwiftUI view in `apps/ios/Runtime/Components/Wordmark.swift`. Three sizes, two themes. Implemented as SVG-equivalent (SwiftUI `Path` or `SVGView`).
3. The SVG source itself — committed to the repo so both platforms render from a single visual definition.

If the evening runs out, cuts in this order:

1. **iOS rendering drops to a placeholder.** A SwiftUI `Text("runtime.")` with `.font(.custom("...", size: ...))` — explicitly wrong (will render Georgia until Source Serif arrives, which on iOS it never will because we decided not to bundle it), but stubs the API. The proper SVG-rendering view becomes the first piece of work in block 5. Web ships fully.
2. **The `theme="dark"` variant drops.** Ship light only. Dark mode in 004 §1 swaps `Inkt` and `Krijt` — for the wordmark this just means the text color changes (the amber dot stays amber). Adding `theme` later is one prop and one conditional. Cuttable.
3. **The `size="splash"` variant drops.** Ship `header` and `inline`. Splash is for the iOS onboarding-welcome and the website hero — neither lands this evening. The size is one more case in a switch. Cuttable.

The non-negotiable is *a `<Wordmark />` component exists on web, renders Source Serif 4 Medium 26pt with the amber period correctly placed, and consumes `--color-eerste-licht` from the design tokens*. That alone proves the upstream pitches.

## Sketch

Four pieces. Piece 1 produces the SVG source both platforms render from.

### 1. The SVG — single source for both platforms

Generate the wordmark `runtime` (without the period) as SVG paths from Source Serif 4 Medium at a canonical viewBox. The period is *not* part of the path; it's a separate `<circle>` element with `fill="var(--color-eerste-licht)"` on web, the equivalent on iOS. This is the resolution of [[../../product-design/004-design-system-and-screens#8. Open questions surfaced this pass|004 §8 question #5]] in concrete form.

How to generate: open Source Serif 4 Medium in any vector tool (Figma, Sketch, Inkscape, Glyphs), type `runtime` at any size with `−0.02em` tracking applied, outline it to paths, export as SVG. Commit the output to `packages/design-tokens/dist/wordmark.svg` (alongside the generated CSS/Swift from [[design-tokens-single-source-of-truth]]):

```svg
<!-- packages/design-tokens/dist/wordmark.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" fill="currentColor">
  <!-- paths for "runtime" rendered from Source Serif 4 Medium @ tracking -0.02em -->
  <path d="..." />  <!-- r -->
  <path d="..." />  <!-- u -->
  <path d="..." />  <!-- n -->
  <path d="..." />  <!-- t -->
  <path d="..." />  <!-- i -->
  <path d="..." />  <!-- m -->
  <path d="..." />  <!-- e -->
  <circle cx="..." cy="..." r="3" fill="#E8A65A" />  <!-- the period -->
</svg>
```

The `viewBox` is set so the baseline sits at a known y-coordinate — this matters for the inline variant, which needs to align with surrounding text. The period's `cx/cy/r` are tuned once at generation time and then sit in the SVG file forever; the size scales the whole SVG, the dot scales with it. The `fill="currentColor"` on the text paths lets the text color follow the consuming context's color (the theme is applied by setting `color` on the parent); the dot's amber stays amber.

The SVG is **committed**, not generated at build time. Source Serif 4 is a font, not a Figma plugin; outlining glyphs from a font requires manual judgement (kerning pairs, optical adjustments) that's worth doing once carefully. Re-generation is a five-minute job if the wordmark ever changes.

### 2. Web — `<Wordmark />` React component

```tsx
// apps/web/app/_components/Wordmark.tsx
import wordmarkSvg from '@runtime/design-tokens/dist/wordmark.svg'  // or inline import

type Size = 'header' | 'inline' | 'splash'
type Theme = 'light' | 'dark'

const HEIGHT: Record<Size, number> = {
  header: 26,
  inline: 17,   // matches body type
  splash: 38,
}

export function Wordmark({ size = 'header', theme = 'light' }: {
  size?: Size
  theme?: Theme
}) {
  const color = theme === 'light' ? 'var(--color-inkt)' : 'var(--color-krijt)'
  return (
    <span
      style={{ color, display: 'inline-block', height: HEIGHT[size] }}
      aria-label="runtime"
      role="img"
    >
      {/* SVG inlined here, height auto-scales via the viewBox */}
      <svg ... />
    </span>
  )
}
```

The `inline` size is new — 004 §1 names header and splash, but inline (matching body type at 17pt) is the size needed for places like *"Runtime is..."* in body copy. Adding it now is cheap.

The amber period inside the SVG carries `fill="var(--color-eerste-licht)"` directly, *not* `fill="currentColor"`. This is the single point in the component where the dot is locked to the brand color regardless of the surrounding theme.

`role="img"` and `aria-label="runtime"` because the wordmark is a logotype, not text — screen readers should announce it once as a name. The full string with period (*"runtime."*) is unnecessary; the period is decoration.

### 3. iOS — `Wordmark` SwiftUI view

The iOS equivalent renders the same SVG. SwiftUI doesn't have a native SVG renderer, but two options work:

- **Option A**: Use the SF Symbols-style approach — convert the SVG paths to SwiftUI `Path` instances. Mechanical and ugly to read but fully native, no dependency.
- **Option B**: Use a small SVG library like SVGKit or Macaw, or render the SVG into a UIImage via `WKWebView` (overkill but works).

Lean Option A for v0 — the SVG has eight paths total, mechanical port is an evening's work, and zero runtime dependencies is the right place to land for a brand-critical component. The paths translate by hand from the committed SVG:

```swift
// apps/ios/Runtime/Components/Wordmark.swift
import SwiftUI

enum WordmarkSize {
  case header, inline, splash

  var height: CGFloat {
    switch self {
      case .header: return 26
      case .inline: return 17
      case .splash: return 38
    }
  }
}

struct Wordmark: View {
  var size: WordmarkSize = .header
  var theme: ColorScheme = .light

  var body: some View {
    let textColor: Color = theme == .light ? .inkt : .krijt

    ZStack {
      // The "runtime" text paths
      RuntimeWordmarkShape()
        .fill(textColor)
      // The amber period as a circle
      Circle()
        .fill(Color.eersteLicht)
        .frame(width: 6, height: 6)  // tuned at component-relative scale
        .offset(x: ..., y: ...)       // baseline-aligned to the SVG's coords
    }
    .frame(height: size.height)
    .accessibilityLabel("runtime")
  }
}

// The hand-ported paths from packages/design-tokens/dist/wordmark.svg
struct RuntimeWordmarkShape: Shape {
  func path(in rect: CGRect) -> Path {
    var path = Path()
    // r, u, n, t, i, m, e — eight subpaths
    // scaled to rect from the SVG's 200x50 viewBox
    return path
  }
}
```

The `Color.eersteLicht` reference is from [[design-tokens-single-source-of-truth]]. The amber-period offset values are computed once from the SVG's viewBox coordinates — same numbers, different syntax.

### 4. Smoke / verification

Add a section to the smoke screen from [[font-integration]]:

```tsx
<div>
  <Wordmark size="splash" theme="light" />
  <Wordmark size="header" theme="light" />
  <Wordmark size="inline" theme="light" />
  <Wordmark size="header" theme="dark" />  {/* on a dark background */}
</div>
```

iOS gets a matching SwiftUI preview screen. Visual confirmation: the period is the same shade of amber at every size, baselines align with surrounding text on the inline variant, the dark-theme variant inverts the text color but keeps the dot.

## Out of scope

- **Animation.** The wordmark doesn't animate in 004 §1 (the period stays still; motion is a separate concern). No fade-in, no period-pulse, no draw-on. Calm motion is itself a brand statement.
- **Themable amber period.** The period is `Eerste licht`. Always. No prop, no variant, no override. If a designer ever wants a different-color period for some context, that's a brand-conversation, not a component-API addition.
- **Wordmark with subtitle / tagline variants.** `runtime` is the wordmark. `runtime — training that fits your race` is a header treatment, not a wordmark, and lives in the page composition, not in this component.
- **Internationalization.** The wordmark is `runtime` in every language. No translation.
- **Live-text fallback on web.** A *"render as live `<span>` text if SVG fails"* branch is the obvious refactor instinct. Resist. The SVG is committed bytes — there's no failure mode to fall back from. If the SVG file is missing, the build is broken, which is fine.
- **Wordmark in marketing assets** (favicon, App Store icon, social cards, OpenGraph images). The favicon is a separate export. The App Store icon is [[app-icon-assets-at-every-size]]. Social cards belong to website pitches in block 2.
- **A "wordmark with period control" prop** (`hasPeriod={false}`). The period is part of the wordmark. The wordmark *is* the period and the letters together. Resist parameterizing.
- **Theme-aware automatic switching.** The component takes an explicit `theme` prop. It does not read `prefers-color-scheme` or the iOS `colorScheme` environment automatically. The parent passes it. Auto-switching adds magic; explicit prop is honest.

## Risks / unknowns

- **The hand-ported SwiftUI `Path` is the most fragile piece.** Eight paths, dozens of bezier control points. A typo while transcribing one control point gives a deformed letter. Mitigation: render the SwiftUI version side-by-side with the web SVG in a single review pass, at multiple sizes; visually compare. If the path port is too painful to get right in the evening, drop iOS to placeholder (appetite cut #1) and revisit when block 5 picks up — there's no rush; iOS doesn't render anywhere user-facing yet.
- **The SVG generation step (outlining Source Serif 4 in a vector tool) requires Source Serif 4 to be installed on Luk's machine, not just on Google Fonts.** Mitigation: download `SourceSerif4-Medium.otf` from the adobe-fonts/source-serif GitHub release, install it locally for the generation pass, then delete it. The font doesn't need to live on the dev machine after the SVG is committed.
- **The `inline` size is new** — it wasn't named in 004 §1. We're inferring a body-text-aligned wordmark size to support places like inline mentions of the product name in copy. Risk: it's wrong and we never use it. Mitigation: it costs nothing to ship. If it's never consumed in three months, delete it.
- **`viewBox`-driven baseline alignment for the inline variant is fiddly.** Putting `<Wordmark size="inline" />` inside a `<p>` should look like the word *runtime* is part of the sentence. SVG baseline alignment in inline contexts has surprising defaults (`vertical-align: baseline` ≠ what most developers expect). Mitigation: set the SVG's viewBox so the text baseline sits at a fixed y-coordinate, then apply `vertical-align: text-bottom` and shim with a small negative margin if needed. Settle this in the smoke screen, not in production usage.
- **Source Serif's outline at very small sizes (inline, ~17pt) might render slightly differently than the live-text would have.** Outlined paths don't hint; live text does. At 17pt this is invisible. At 11pt or smaller it would matter — but we never render the wordmark below the body size. Not a real risk; flagged for completeness.
- **The period's amber on a dark background needs to stay amber, not invert.** The component's `theme` prop swaps the text color (Inkt ↔ Krijt) but leaves the period alone. The risk is that someone reads the code, sees a `theme === 'dark'` branch, and "helpfully" adds a dark-theme amber variant later. Mitigation: a clear comment at the period's fill declaration — `// Always Eerste licht. Per 004 §1, the amber never scales or shifts.`

## Related

- Block: [[blocks/01-brand-system-in-code]]
- Design source: [[../../product-design/004-design-system-and-screens#1. The system]] — Wordmark and color discipline.
- Open question resolved here in concrete form: [[../../product-design/004-design-system-and-screens#8. Open questions surfaced this pass|004 §8 #5]] (wordmark-as-SVG → committed SVG, period as a separate `<circle>`).
- Sibling pitches in this block:
  - [[design-tokens-single-source-of-truth]] — supplies `--color-eerste-licht`, `--color-inkt`, `--color-krijt`. First real consumer of the tokens.
  - [[font-integration]] — settles whether Source Serif 4 needs to be bundled (no on iOS; yes on web but redundant given this pitch's SVG choice). This pitch is the proof.
- Downstream consumers: every block. The website header in [[02-website-foundation]], the calendar header in [[03-race-calendar]], the intake header in [[04-pilot-intake]], the iOS onboarding in [[05-ios-app-downsized]].

---

## What actually happened

> *Stub drafted by Claude from the diff — Luk to edit before next ship.*

Shipped the web half. iOS deferred per appetite cut #1 (still no `apps/ios/`).

The trickiest piece was generating the SVG path data from Source Serif 4 Medium. **Source Serif 4 has no static `Medium` (500) OTF in the canonical adobe-fonts/source-serif repo** — only Regular (400) and Semibold (600), with the variable font carrying weight 500 along the wght axis. `opentype.js` (the Node outliner) doesn't expose Source Serif's variable axis on this build either. So the pipeline is: download the variable Roman TTF, use `fontTools varLib.instancer` via `uvx --from fonttools fonttools` to materialize a static instance at `wght=500 opsz=26`, then feed that static instance to `opentype.js`. Two-step, but reproducible and documented in the design-tokens README's *"Regenerating the wordmark"* section. Source font files are not committed — fetched into `/tmp`, used, deleted.

Architecture deviation from the pitch sketch: rather than one SVG file consumed by both web (inline import) and iOS (manual SwiftUI Path port), the generator emits **two artefacts**:

- `dist/wordmark.svg` — human-readable SVG for design-tool inspection and any non-React consumer.
- `dist/wordmark.ts` — `WORDMARK_PATH` (the `d` attribute string), `WORDMARK_PERIOD` (`{cx, cy, r}`), `WORDMARK_VIEWBOX`. The React component imports these and builds the JSX itself.

This is cleaner than parsing the SVG file at build time and avoids needing `@svgr/webpack` or similar. When Block 5's SwiftUI port lands, it'll consume the same `wordmark.ts` values via JSON, or better, a `Wordmark.swift` generated by extending `generate-wordmark.mjs` to emit Swift `Path` directives — one source, two adapters.

The component itself (`apps/web/app/_components/Wordmark.tsx`) is ~50 lines:

- Three sizes via a `Record<Size, number>` height map: `header: 26`, `inline: 17`, `splash: 38`.
- Two themes: `light` → text uses `var(--color-inkt)`, `dark` → text uses `var(--color-krijt)`. The amber period stays `var(--color-eerste-licht)` on both — locked at the JSX level, called out in a comment per the pitch's risk section.
- Aspect-correct rendering via the viewBox's width/height ratio applied to the chosen pixel height.
- `role="img" aria-label="runtime"` — screen readers announce it once as a name, not seven separate letters.
- `vertical-align: text-bottom` on the inline size to align baselines inside body copy.

The smoke screen on `/` now shows splash, inline (mid-paragraph), header light, and header dark (on an Inkt panel) — all four rendering from the same SVG path data. Confirmed visually: amber period sits where Source Serif's natural period would, at the right relative weight; the dark variant inverts text but keeps the amber.

What was cut: the iOS SwiftUI `Wordmark` view (cut #1). When `apps/ios/` exists in Block 5, the path is to (a) extend `generate-wordmark.mjs` to also emit `dist/Wordmark.swift` with SwiftUI `Path` calls drawn from the same source data, or (b) hand-port from `dist/wordmark.ts`. Option (a) is the design-tokens way; (b) is the pitch's original plan. Decide then.

What was anticipated and resolved: my [[font-integration]] resolution paragraph in [[../product-design/004-design-system-and-screens|004]] §8 #5 had committed to "live text on web", which contradicted this pitch's "single SVG for both platforms" stance. Updated that paragraph during this pitch to match: SVG on both, Source Serif loaded on web for non-wordmark surfaces only.

Surprises:

- **No static Medium OTF**, as called out above. The fontTools instancing dance took the longest part of the evening. Now documented in the regeneration recipe so future-Luk doesn't rediscover the gotcha.
- **opentype.js v1.3.4 has no `font.variation` API in Node**. It was added in later releases (1.4.x?) but is still flagged experimental. Working around it via fontTools instancing turned out to be cleaner anyway — the static instance is a deterministic input.
- **The generated `WORDMARK_PATH` string is ~6kb**. That's the actual outlined glyphs of `runtime` at 100pt source resolution with 2 decimal places of precision. Small enough to bundle inline; large enough that I considered minifying via path simplification. Decided no — the precision is honest to the font, and the SVG compresses well in transit.

Block 1 closes here. Next is Block 2's *GitHub Actions CI* slot (or whatever Luk picks). No release step run yet; commitizen is wired but the next ship after the first `cz bump` will do that work.
