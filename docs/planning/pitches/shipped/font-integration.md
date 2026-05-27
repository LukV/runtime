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
# Font integration

## Problem

The type system in [[../../product-design/004-design-system-and-screens#1. The system|004 §1]] names three families: **Source Serif 4** (wordmark only), **Inter** (everything else), and **JetBrains Mono** (numerics). All three are OFL-licensed, all three live on Google Fonts, total typography cost is €0. The decision is settled; the integration isn't.

Until the fonts are actually loading on web and registered in iOS, every screen we build falls back to Georgia and system-ui. That's literally what the SVGs in 004 declare (*"Production code should swap these to Source Serif 4 and Inter respectively"* — note at the bottom of §1). The wordmark currently shipping in those SVGs is set in Georgia. The visual proportions hold but the *voice* doesn't — Georgia is a Times-grade general-purpose serif, Source Serif is a Lewis-grade transitional. The brand register is in the letterforms.

The wordmark question from [[../../product-design/004-design-system-and-screens#8. Open questions surfaced this pass|open question #5]] is gated on this pitch and the answer is *yes, inline as SVG*. Source Serif 4 will not be bundled in the iOS app — the wordmark is the only place it appears, and 80kb of font for one piece of text is the wrong trade. The font appears on the web (where caching across the wider web makes the cost zero in practice), and the iOS wordmark is an SVG path. That decision changes what *font integration* actually means per platform:

- **Web** loads three families (Source Serif 4 for the wordmark, Inter for UI, JetBrains Mono for numerics).
- **iOS** registers two (Inter and JetBrains Mono). Source Serif 4 is not bundled.

This pitch ships both halves.

## Appetite

**An evening.** Cap is binding. The pitch ships:

1. **Web**: Inter Variable, JetBrains Mono, and Source Serif 4 loading on every page of `apps/web/` via Next.js's `next/font` integration. Self-hosted (not Google's CDN). FOIT/FOUT behaviour verified.
2. **iOS**: Inter Variable and JetBrains Mono bundled with the app, registered in `Info.plist`, and reachable via SwiftUI's `Font.custom()`. A small smoke screen demonstrates each family rendering.
3. A one-paragraph note in `packages/design-tokens/README.md` pointing future contributors at how fonts and tokens connect.

If the evening runs out, cuts in this order:

1. **Self-hosting drops to Google Fonts CDN.** `next/font/google` instead of `next/font/local`. Tiny privacy cost (Google sees font requests), 90% of the implementation simplification. Self-host is the right end state — the CDN is a fine first step.
2. **iOS registration drops entirely.** Web ships fonts; iOS stays system-default. iOS doesn't enter the build until block 5 — bundling fonts on a project that isn't being touched for weeks can wait. The wordmark-as-SVG decision means iOS never *needs* Source Serif anyway; bundling Inter and JetBrains Mono can be the first piece of work in block 5.
3. **JetBrains Mono drops in v0.** Inter ships with `tnum` (tabular numerics) enabled — it carries us until any dedicated numeric-mono block is needed. JetBrains Mono returns when a screen lands that actually uses it (likely Vandaag's pace/duration readouts).

The non-negotiable is *Inter rendering in the web app and the wordmark rendering in Source Serif 4 on the web*. If only one of those works, the pitch hasn't shipped.

## Sketch

Four pieces. The wordmark-as-SVG decision is settled in piece 0 because it changes what pieces 2 and 3 do.

### 0. Resolve the wordmark-as-SVG question — five minutes

Read [[../../product-design/004-design-system-and-screens#8. Open questions surfaced this pass|004 §8 open question #5]] and commit to *yes, inline SVG, do not bundle Source Serif in iOS*. The argument:

- Source Serif appears in exactly one place per platform (the wordmark).
- An SVG path is ~2kb; Source Serif Medium is ~80kb. 40x savings.
- The amber period becomes an independent `<circle>` element with `fill="var(--color-eerste-licht)"` (web) or `Color.eersteLicht` (iOS) — no font-loading risk on the brand device.
- The mark renders at any size without subpixel surprises.
- The exported SVG is generated once from the Source Serif glyphs and committed; we don't need a font runtime to render text we never re-typeset.

Cost: the SVG is platform-portable, slightly larger source-control footprint, and any future wordmark text variant ("runtime studio", "runtime club") needs a new SVG export. All acceptable.

This decision lives in `004` (a one-line append to §8 resolving the open question) and unblocks both the iOS half of this pitch and the [[wordmark-as-component]] pitch immediately after.

### 1. Web — `next/font/local` with self-hosted woff2

`apps/web/` uses Next.js's font system. Files live in `apps/web/public/fonts/` (or `apps/web/app/fonts/` depending on the app-router setup). Source the fonts from Google Fonts' GitHub repos:

- **Inter Variable** — `Inter-VariableFont_slnt,wght.woff2` from rsms/inter. One file, full weight range.
- **JetBrains Mono Variable** — `JetBrainsMono-VariableFont_wght.woff2` from JetBrains/JetBrainsMono.
- **Source Serif 4 Medium** — single static weight, `SourceSerif4-Medium.woff2` from adobe-fonts/source-serif. We don't need the full family; only Medium (500) is named in 004 §1.

Wire in the root layout:

```tsx
// apps/web/app/layout.tsx
import localFont from 'next/font/local'

const inter = localFont({
  src: '../public/fonts/Inter-VariableFont_slnt,wght.woff2',
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = localFont({
  src: '../public/fonts/JetBrainsMono-VariableFont_wght.woff2',
  variable: '--font-mono',
  display: 'swap',
})

const sourceSerif = localFont({
  src: '../public/fonts/SourceSerif4-Medium.woff2',
  variable: '--font-wordmark',
  display: 'swap',
  weight: '500',
})

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

The CSS variables map cleanly to the `--font-*` names the design-tokens generator can refer to. `display: swap` because FOUT (text appears in fallback, swaps to web font) is preferable to FOIT (blank text) for a content site. The wordmark's brand-critical role is mitigated by the wordmark-as-SVG decision — the inline SVG renders the *shape* without depending on the font load at all.

Inter's `font-feature-settings` (`cv11` for single-storey `a`, `tnum` for tabular numerics) get applied in `globals.css`:

```css
body {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-feature-settings: 'cv11' 1, 'tnum' 1;
}
```

004 §1 calls `cv11` taste-dependent — neither is wrong. Ship with it on; it's the closer match to ABC Diatype (the family Inter was chosen to stand in for) and easier to turn off later than to turn on retroactively.

### 2. iOS — bundle Inter and JetBrains Mono only

Drop two font files into `apps/ios/Runtime/Fonts/`:

- `Inter-VariableFont_slnt,wght.ttf` (iOS prefers ttf over woff2)
- `JetBrainsMono-VariableFont_wght.ttf`

In Xcode: add them to the project's `Resources` build phase. In `Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
  <string>Inter-VariableFont_slnt,wght.ttf</string>
  <string>JetBrainsMono-VariableFont_wght.ttf</string>
</array>
```

Then a small extension exposes the families to SwiftUI:

```swift
// apps/ios/Runtime/Generated/Tokens.swift (or a sibling file)
extension Font {
  static func body(_ size: CGFloat = 17) -> Font { .custom("Inter", size: size) }
  static func display(_ size: CGFloat = 56) -> Font { .custom("Inter", size: size).weight(.bold) }
  static func numeric(_ size: CGFloat = 14) -> Font { .custom("JetBrainsMono-Regular", size: size) }
}
```

The exact PostScript names depend on what Xcode reads from the variable font — Inter's variable font registers as `"Inter"` with weight resolved via `.weight(.bold)`, JetBrains Mono usually as `"JetBrainsMono-Regular"`. Verify both with a one-line print at app start (`for family in UIFont.familyNames { print(family, UIFont.fontNames(forFamilyName: family)) }`); adjust names if needed.

Source Serif 4 is not bundled. The wordmark in iOS renders via the [[wordmark-as-component]] SVG component.

### 3. Smoke screen

A throwaway `apps/web/app/_fonts/page.tsx` route (or its iOS equivalent) renders every type role from 004 §1 once:

```tsx
<div>
  <h1 className="font-display">Tempo. 8 km.</h1>
  <p className="font-body">17pt body text in Inter Regular.</p>
  <p className="font-label">LABEL CAPS IN INTER MEDIUM 0.15EM</p>
  <p className="font-mono">12,500m / 4:32 / 184bpm</p>
  <svg>...</svg> {/* wordmark inline SVG with Source Serif Medium shapes */}
</div>
```

Visual confirmation each family loads. Page can be deleted or kept as a brand-system reference. The iOS smoke equivalent is a single SwiftUI preview screen showing the same five lines.

### 4. README note in `packages/design-tokens/`

One paragraph at the bottom of the README from [[design-tokens-single-source-of-truth]]:

> The `type` tokens name font families (`Source Serif 4`, `Inter`, `JetBrains Mono`). The fonts themselves are integrated separately — in `apps/web/app/layout.tsx` via `next/font/local` and in `apps/ios/Runtime/Fonts/` via `Info.plist` registration. If you add or change a font, update *both* this token file and the platform-specific integration.

That's the connection between the two pitches. The tokens know the *names*; the apps know the *bytes*.

## Out of scope

- **Bundling Source Serif 4 in iOS.** Decided no in piece 0. The wordmark is an SVG path on iOS.
- **Additional Source Serif weights or styles.** Only Medium 500 is named in 004 §1. Other weights aren't needed and bundling them costs without benefit.
- **Variable-font axis exploration beyond weight.** Inter's variable font carries slant and weight axes. The slant axis is never used in 004 §1; we don't expose it.
- **Font subsetting.** Both Inter and JetBrains Mono are ~250kb compressed; Source Serif 4 Medium is ~80kb. Total ~580kb on first web visit, cached forever after. Not worth the build-pipeline cost to subset down for v0. Revisit if Lighthouse scores drag.
- **Light/dark variant fonts or different weights per theme.** The system uses one weight family across themes; theme change doesn't swap fonts.
- **Custom fallback stacks.** `system-ui, sans-serif` after Inter; Georgia equivalent after Source Serif. Standard fallbacks, no special platform-tuned stacks.
- **Service-worker font caching.** Next.js's default caching headers on `public/fonts/` are enough for v0. Revisit if cold-load performance becomes a complaint.
- **Email template fonts.** Resend's React Email templates use system fonts by convention — bundling web fonts in email is unreliable across clients anyway. Not in scope; `packages/email/` lives separately.

## Risks / unknowns

- **The exact PostScript names of variable fonts vary by source build.** Inter's variable build from rsms/inter registers as `"Inter"` with weight resolved at the call site; some forks register as `"Inter-Variable"`. JetBrains Mono Variable has similar variance. Mitigation: dump `UIFont.familyNames` on iOS launch once and confirm the names match what the helpers reference. Adjust the helper in the same evening.
- **Next.js `next/font/local` requires the font files to be in a specific location relative to the importing module.** Different paths break the loader silently in build, not at runtime. Mitigation: follow the documented Next.js convention (`apps/web/app/fonts/` or `apps/web/public/fonts/`) and confirm the build succeeds locally before shipping.
- **The wordmark-as-SVG decision changes whether Source Serif loads at all on iOS, and that interlocks with `tokens.json`.** Tokens currently name `Source Serif 4` in the `type.wordmark.family` field. If iOS never loads the font, that field is misleading on iOS. Mitigation: the tokens are platform-agnostic *names*; consumers decide how to interpret them. The iOS wordmark component reads the SVG, not the token's family field. Document this in the README note (piece 4).
- **Inter's `cv11` (single-storey `a`) feature is on by default in this pitch.** 004 §1 calls it taste-dependent. If it looks wrong once enough text exists, flipping it off is a one-line change in `globals.css`. Not a real risk, but flagged because someone reading the code months later might wonder why the `a` looks the way it does.
- **Self-hosting fonts increases the `apps/web/` repo size by ~600kb.** Acceptable. The alternative (Google CDN via `next/font/google`) has a privacy cost (Google sees every page-load referer) that compounds at scale. Self-host is the v0 default; switch only if a deploy pipeline complains.
- **Source Serif 4 Medium for the wordmark on web is only used if the wordmark-as-SVG decision lands as "yes inline SVG everywhere."** If web keeps the wordmark as live text (a defensible choice — easier to theme, accessible to screen readers as text), the font load is justified. If web also goes SVG-only, the Source Serif load is dead weight on every page. Mitigation: ship the font loading regardless in v0 because (a) the file is small and cached, (b) [[wordmark-as-component]] decides the web treatment separately, and (c) removing the font load later is a one-line change. The wasted ~80kb is a fair price for not coupling the two pitches.
- **Variable fonts may render slightly differently across platforms (Inter on macOS Safari vs Chrome on Windows).** Real but minor; the rendering differences are smaller than the design system's tolerances. Not worth fighting.

## Related

- Block: [[blocks/01-brand-system-in-code]]
- Design source: [[../../product-design/004-design-system-and-screens#1. The system]], specifically the Wordmark and Type system subsections.
- Open question resolved here: [[../../product-design/004-design-system-and-screens#8. Open questions surfaced this pass|004 §8 #5]] (wordmark-as-SVG → yes inline SVG, do not bundle Source Serif in iOS).
- Sibling pitches in this block:
  - [[design-tokens-single-source-of-truth]] — names the font families; this pitch makes the names load.
  - [[wordmark-as-component]] — first consumer; its iOS branch depends on the SVG decision being settled here.
- Stack: [[../../architecture/001-stack-decisions#Monorepo structure]]

---

## What actually happened

> *Stub drafted by Claude from the diff — Luk to edit before next ship.*

Shipped the web half cleanly; deferred the iOS half (per appetite cut #2 — `apps/ios/` still doesn't exist; Block 5 inherits the work).

Piece 0 landed first: appended a resolution paragraph to [[../product-design/004-design-system-and-screens#8. Open questions surfaced this pass|004 §8 question #5]] — *wordmark-as-SVG → yes on iOS; web keeps Source Serif loaded so the live-text fallback exists.* That decision unblocks [[wordmark-as-component]].

On the web, three families load via `apps/web/app/layout.tsx`:

- **Inter Variable** — self-hosted in `apps/web/app/fonts/InterVariable.woff2` (352kb, from rsms's canonical build). Loaded via `next/font/local` with `weight: '100 900'` so the variable axis covers every weight from one file. Exposed as `var(--font-inter)` and applied to `body` in `globals.css` with `font-feature-settings: 'cv11' 1, 'tnum' 1` per 004 §1.
- **Source Serif 4 Medium** — `next/font/google` with `weight: '500'`. Exposed as `var(--font-wordmark)` and applied only to the wordmark in the smoke screen. The web wordmark stays live text in this pitch; [[wordmark-as-component]] decides whether the production component renders SVG or live text on web.
- **JetBrains Mono** — `next/font/google` with `weight: ['400', '500']`. Exposed as `var(--font-mono)`.

The hybrid (`local` for Inter, `google` for the other two) is a deviation from the pitch's primary plan, which named `next/font/local` for all three. Reason: in Next 15, **`next/font/google` self-hosts at build time** — Next downloads the woff2 during `next build`, hashes it, serves it from `/_next/static/media/`, and never makes a runtime request to Google. Privacy-wise it's identical to `next/font/local`. So the pitch's cut #1 (*"drop self-hosting to Google CDN"*) was based on an outdated model of how `next/font/google` works; the modern reality is that cut #1 IS self-hosting, just with less file-management on our side. Inter stayed local because the canonical rsms build (a single variable woff2) is meaningfully nicer than Google's subsetted Inter files, and we already had it.

The smoke screen on `/` now renders every type role from 004 §1: the wordmark in Source Serif 4 Medium with the amber period, the *"Tempo. 8 km."* display headline in Inter Bold two-tone (Inkt + Steen), Inter body and label caps, and a JetBrains Mono numerics line (*12,500m · 4:32 · 184 bpm*). Build is clean: 1.6s Next compile, 4 static pages, 6 woff2 files in `/_next/static/media/`.

Piece 4 was already done — the *"How fonts connect"* paragraph in `packages/design-tokens/README.md` was written ahead during the design-tokens pitch. This pitch updated it: bare wikilinks `[[font-integration]]`/`[[wordmark-as-component]]` instead of relative paths that'd break when pitch files move to `shipped/`.

What was cut: the iOS half entirely (no `apps/ios/` exists yet). When Block 5 picks up:

- Inter Variable TTF + JetBrains Mono Variable TTF get dropped into `apps/ios/Runtime/Fonts/`.
- `UIAppFonts` entry in `Info.plist`.
- A SwiftUI `Font` extension exposes them via `.custom("Inter", size:)` etc.
- Source Serif 4 is **not** bundled on iOS — wordmark is inline SVG per the now-resolved 004 §8 #5.

Risk that landed: the `cv11` feature is on by default per the pitch. If at any point the lowercase `a` reads wrong, flip it off in `globals.css`. Easier to flip off later than to flip on retroactively.

No surprises. Release step skipped per the ongoing pattern (commitizen is configured at `.cz.toml` now; first `cz bump` is still pending the initial commit).
