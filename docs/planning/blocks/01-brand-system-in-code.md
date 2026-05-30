---
project: runtime
type: planning-block
block: brand-system-in-code
status: in-progress
updated: 2026-05-30
---
# Block 1 — Brand System in Code

The design system from [[../../product-design/004-design-system-and-screens]] translated into actual code that the website and the iOS app share. Design tokens, type stack, the ribbon component, the wordmark, the app icon. The thing every other block depends on.

This block is small but **foundational** — it's the only one that has to ship before others can begin. Getting it right means the calendar, intake, and app all look like the same product without having to reinvent variables three times.

**Status: 4 of 5 slots shipped.** Tokens, fonts, and the wordmark landed on 2026-05-27; the race ribbon landed on 2026-05-30. The app icon is the last open slot — pitched and on deck. See [[../In Cycle]] and the slots below.

Design: [[../../product-design/004-design-system-and-screens]].

## Pitches

### Design tokens as the single source of truth — *an evening* — [[../pitches/shipped/design-tokens-single-source-of-truth|shipped 2026-05-27]]

Lock the color palette, type stack, spacing scale, and motion timings from [[../../product-design/004-design-system-and-screens#1. The system|the design system note]] into a tokens file — CSS custom properties for web, a Swift enum (or `.xcassets` + a constants file) for iOS. Same names in both (`--inkt`, `--krijt`, `--eerste-licht`, `--veldgroen`, etc.).

*Why this matters.* The system has been designed in SVGs and figmaland prose. Without a tokens file, every future pitch reinvents the palette and we drift inside a fortnight. The tokens are the single point of truth so a color change is a one-line PR.

*Sketch.* `tokens.css` for the web, exported also as a JSON file. iOS reads the same JSON at build time and generates a Swift `Color` extension. Both projects import from the same canonical source — the JSON lives in a small shared package or just in the design folder under version control.

*Out of scope.* Theme switching, light/dark per-component variables (only the surface-level ones for now), animation library setup.

### Font integration — *an evening* — [[../pitches/shipped/font-integration|shipped 2026-05-27]]

Add **Source Serif 4**, **Inter**, and **JetBrains Mono** to the project. Web: Google Fonts CDN with `font-display: swap`, or self-hosted woff2 if we want offline. iOS: bundle Inter Variable and JetBrains Mono with the app, register them in `Info.plist`. Source Serif used wordmark-only.

*Open question.* See [[../../product-design/004-design-system-and-screens#8. Open questions surfaced this pass|open question #5]] — ship the wordmark as an inlined SVG path instead of bundling Source Serif at all. Saves ~80kb in the iOS bundle and makes the amber period an independent `<circle>` we can theme without font fallback risk. **Decide before this pitch starts** — the answer changes whether Source Serif gets bundled at all. *(Resolved during the pitch as: yes inline SVG, do not bundle Source Serif in iOS.)*

### The wordmark as a component — *an evening* — [[../pitches/shipped/wordmark-as-component|shipped 2026-05-27]]

`<Wordmark size="header|inline|splash" theme="light|dark" />` for web, equivalent for iOS. Renders `runtime` in Source Serif Medium with the amber period (`#E8A65A`), with `text` color following the theme.

If [the wordmark-as-SVG question](#font-integration--an-evening) lands as *yes, inline SVG*, this becomes a single `<svg>` component instead of a styled text element. Either way, same API.

### The race ribbon component — *an evening* — [[../pitches/shipped/race-ribbon-component|shipped 2026-05-30]]

The brand's structural hook ([[../../product-design/004-design-system-and-screens#The hook — race ribbon]]). Single component in both web and iOS: takes `currentWeek`, `totalWeeks`, and `caption` props. Renders the ribbon at any tick count from 6 to 18 (or beyond, but those are the pilot range). Square flag at the right, amber dot at current week, ink pole for both.

*Why a component.* Used on Vandaag, onboarding plan preview, partner admin, website nav-adjacent area (small mode), and the wedstrijd sheet header. Six places. If each instance is hand-coded the brand drifts inside a week.

*Web-first, iOS deferred.* Following the precedent set by [[../pitches/shipped/wordmark-as-component]] and [[../pitches/shipped/font-integration]], the pitch ships the web component this evening and leaves a clean handoff (geometry constants in `dist/ribbon.ts`) for block 5 to pick up the iOS port.

### App icon assets at every size — *an evening* — [[../pitches/app-icon-assets-at-every-size|pitch ready]]

Export the icon from the design SVG at every Apple-required size (180, 120, 80, 60, 40, 29, plus 1024 for the App Store). Same icon, just rasterized cleanly. Make sure the amber dot lands on a pixel boundary at every size.

*Risk.* Rasterizing SVG to PNG at small sizes (29×29) loses the dot if subpixel rendering is bad. Inspect each export manually.

*Pipeline now, catalog wiring at block 5.* The pitch ships the master SVG, the export pipeline (`packages/design-tokens/scripts/generate-icons.mjs` → `dist/icons/`), and a manifest describing each PNG's intended catalog binding. The five-minute `Assets.xcassets` wiring lands at the start of [[05-ios-app-downsized]] when `apps/ios/` exists.

## Dependencies

This block depends on nothing — it's pure derivation from [[../../product-design/004-design-system-and-screens|the design system]].

Everything else depends on this:
- [[02-website-foundation]] needs tokens + wordmark ✓ (ribbon optional for block 2)
- [[03-race-calendar]] needs tokens + wordmark ✓
- [[04-pilot-intake]] needs tokens + wordmark ✓
- [[05-ios-app-downsized]] needs tokens + wordmark ✓ + ribbon ✓ + app icon (pitch ready)
