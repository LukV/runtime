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
# App icon assets at every size

## Problem

[[../../product-design/004-design-system-and-screens#App icon|004 §1's app icon section]] is one of the shortest in the design note and one of the easiest to underestimate. The icon is *one tick from the ribbon, taken out of the screen and put on the home screen*. Ink square, vertical white stroke (= the *vandaag* tick), amber dot at its center. Same shape, same color, same job as the ribbon's current-week marker. Look at [[004-design-system.svg]]

The visual is settled. The shipping problem isn't *what* the icon is; it's that iOS wants ten of it. Apple requires the icon at 1024 (App Store), 180 (iPhone @3x), 120 (iPhone @2x), 80 (Spotlight @2x), 60 (Settings @3x), 40 (Spotlight @2x), and 29 (Settings @2x) at minimum — plus the @1x variants of each that nobody ships anymore but the catalog still asks for. And every one of them has to be a separate raster (`.png`) because `Assets.xcassets` doesn't accept SVG for icons.

At 1024 the icon is trivial — antialiasing has all the room it needs. At 29×29 the amber dot is *one pixel* and the whole design lives or dies on whether that pixel lands on a pixel boundary or smears across two. *"Make sure the amber dot lands on a pixel boundary at every size"* (the block-1 note's exact words) isn't a stylistic preference — it's the difference between a sharp, recognisable mark at home-screen size and a smudged warm-grey blur that looks like a rendering bug.

There's a second problem: **`apps/ios/` doesn't exist yet.** It lands in block 5. The shipped pitches in block 1 — tokens, fonts, wordmark — have all deferred their iOS halves for exactly this reason: there's nowhere for the iOS half to land. Strictly, the app icon's *only* consumer is iOS, and there's no `Assets.xcassets` to place the PNGs into.

So this pitch can't ship the final wiring — the `Contents.json` and the file placement inside `Assets.xcassets` belong to block 5. What this pitch *can* ship, and what's worth doing now while the brand context is warm, is **the master SVG and the export pipeline**: a single authored icon at high precision, a generator script that produces every required raster size in `packages/design-tokens/dist/icons/`, and verification (pixel-boundary inspection, visual diff at small sizes) that the export is correct. Block 5 inherits a `dist/icons/` folder full of correct PNGs and does the catalog wiring as a five-minute job.

## Appetite

**An evening.** Cap is binding. The pitch ships:

1. **Master icon SVG** at `packages/design-tokens/icons/app-icon.svg`. Authored once at high precision (1024×1024 native), all geometry parametric to a 1024-unit viewBox so the pixel-boundary math at small sizes is computable, not eyeballed.
2. **Generator script** at `packages/design-tokens/scripts/generate-icons.mjs`. Reads the master SVG, renders to PNG at every Apple-required size, writes to `packages/design-tokens/dist/icons/app-icon-{size}.png`. Uses `sharp` (Node-native SVG-to-PNG rasterizer with subpixel control) — the one new dependency this pitch introduces.
3. **A `dist/icons/MANIFEST.json`** listing every emitted size and the intended catalog binding (idiom, scale, role) so block 5 can generate `Assets.xcassets/AppIcon.appiconset/Contents.json` from it programmatically rather than by hand.
4. **Verification**: a small `verify-icons.mjs` script that renders each PNG at 4× zoom into a single comparison sheet (also a PNG, in `dist/icons/_verify.png`), so the manual pixel-boundary inspection of the 29×29 dot is a one-look job.
5. **README update** in `packages/design-tokens/README.md` — a *"Regenerating the icons"* section parallel to the existing *"Regenerating the wordmark"* one, plus a *"Block 5 handoff"* sub-section telling future-Luk (or future-Claude) exactly what to copy where.

iOS catalog wiring is **explicitly not in scope** — it can't be, because `apps/ios/` doesn't exist. The wiring lands as part of block 5's first pitch as a five-minute job consuming this pitch's outputs.

If the evening runs out, cuts in this order:

1. **The verify-sheet script drops first.** Skip the 4× zoom comparison render; do the pixel-boundary inspection by opening each PNG in Preview at 1600% manually. Slower visual check, same outcome. The PNGs themselves still ship.
2. **The MANIFEST.json drops.** Block 5 hand-writes the `Contents.json` from the filenames in `dist/icons/`. ~30 minutes of typing in block 5 instead of a script run. Acceptable.
3. **Sizes below 60 drop.** Ship 1024, 180, 120, 80, 60 — the everyday-visible sizes. The 40 and 29 catalog slots are for Spotlight and Settings, which a user sees rarely; block 5 can render them later, or even just up-scale the 60 temporarily. Risky-ish (the smallest sizes are where the dot rendering is hardest, so deferring them defers the hard problem) but acceptable.

The non-negotiable is *a master SVG exists, the export pipeline renders at least the 1024 + 180 sizes correctly, and the amber dot is sharp at 180×180*. Below that bar the pitch hasn't shipped.

## Sketch

Five pieces. Piece 1 — the geometry — is the load-bearing one because the pixel-boundary problem is solved at authoring time, not at export time.

### 1. Master icon SVG — parametric geometry

The icon's three elements per 004 §1:

- **Ink square** — `var(--color-inkt)` (`#0D1014`) filling the icon's content area. Per iOS conventions, the icon is rendered inside a rounded square mask Apple applies at the OS level — so the SVG content area is a full square, not a rounded one. Background extends to the viewBox edges; iOS rounds the corners.
- **Vertical white stroke** — the `vandaag` tick from the ribbon, isolated. `var(--color-krijt)` (`#F6F5F1`). Stroke width and height are the *single design decision* of the icon — they have to read as "tick" at every size and not collapse to "thin line" at 29px.
- **Amber dot** — `var(--color-eerste-licht)` (`#E8A65A`). Centered at the icon's geometric center, overlapping the white stroke. The brand device.

Authoring at 1024×1024 native, parametric on three numbers:

```svg
<!-- packages/design-tokens/icons/app-icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <!-- ink ground -->
  <rect width="1024" height="1024" fill="#0D1014"/>
  <!-- vandaag tick — vertical white stroke through the center -->
  <rect
    x="492" y="320"
    width="40" height="384"
    fill="#F6F5F1"
  />
  <!-- amber dot — centered, overlapping the tick -->
  <circle cx="512" cy="512" r="80" fill="#E8A65A"/>
</svg>
```

The three values that decide the design at this stage:

| At 1024 | Element | Why this value |
|---|---|---|
| `width="40"` on the tick | tick stroke width | At 29px output, that's ~1.13px — rounds to 1px stroke. At 60px output, ~2.34px → 2px. At 180px → ~7px. Each rounds to a whole pixel, so the tick is always sharp. |
| `height="384"` on the tick | tick length | ~37% of the icon. At 29px → ~11px tall. Reads as a deliberate tick, not a hairline, at every size. |
| `r="80"` on the dot | dot radius | ~16% diameter. At 29px → ~4.5px diameter (matches the ribbon's *"4-5px dot"* spec). At 1024 → 160px diameter. The dot is the brand device at the same relative scale across every context — phone home screen, App Store listing, and the ribbon. |

Each value is divisible cleanly into 1024 such that integer-pixel rounding at common sizes lands on pixel boundaries. The dot's center at `(512, 512)` is the icon's exact center — at *every* even output size, the dot's center is the exact center pixel; at odd sizes (29 is odd; the rest are even), the dot still subpixel-centers because its diameter is also even-divisible, which keeps the dot symmetric around the center pixel.

This is the *"amber dot on a pixel boundary"* discipline — solved at authoring by choosing values that round cleanly at every required output size, not solved at export by tweaking subpixel rendering settings.

### 2. Generator script — `scripts/generate-icons.mjs`

```javascript
import sharp from 'sharp'
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const SIZES = [
  // [px, idiom, scale, role]
  [1024, 'ios-marketing', 1, 'app-store'],
  [180, 'iphone', 3, 'app'],
  [120, 'iphone', 2, 'app'],
  [80, 'iphone', 2, 'spotlight'],
  [60, 'iphone', 3, 'settings'],
  [40, 'iphone', 2, 'spotlight'],
  [29, 'iphone', 2, 'settings'],
  // Apple still allows @1x in the catalog spec, but iOS hasn't shipped a
  // non-Retina device since 2014. Skipping @1x variants intentionally.
]

const svg = readFileSync('packages/design-tokens/icons/app-icon.svg')
const outDir = 'packages/design-tokens/dist/icons'
mkdirSync(outDir, { recursive: true })

const manifest = []
for (const [size, idiom, scale, role] of SIZES) {
  const filename = `app-icon-${size}.png`
  await sharp(svg)
    .resize(size, size, {
      kernel: 'lanczos3',          // crisp downscale; matters at 29px
      fit: 'fill',
    })
    .png({ compressionLevel: 9 })
    .toFile(join(outDir, filename))
  manifest.push({ filename, size, idiom, scale, role })
}

writeFileSync(
  join(outDir, 'MANIFEST.json'),
  JSON.stringify({ generated: new Date().toISOString(), icons: manifest }, null, 2)
)
```

The `kernel: 'lanczos3'` choice is deliberate. Sharp's default downscale is `lanczos3` which is the right call for graphic content with sharp edges (the tick); the alternatives (`mitchell`, `cubic`) produce subtly softer results that show at 29px. Don't change this without inspecting the 29px output.

The script adds **`sharp` as a dev dependency** to the design-tokens package — the first dependency the package has taken on. Worth a one-line note in the package README explaining why (native SVG rasterizer; nothing in stdlib does this).

### 3. MANIFEST.json — block 5 handoff

The manifest sits next to the PNGs and describes what each one is *for*:

```json
{
  "generated": "2026-05-27T20:34:12.000Z",
  "icons": [
    { "filename": "app-icon-1024.png", "size": 1024, "idiom": "ios-marketing", "scale": 1, "role": "app-store" },
    { "filename": "app-icon-180.png",  "size": 180,  "idiom": "iphone", "scale": 3, "role": "app" },
    { "filename": "app-icon-120.png",  "size": 120,  "idiom": "iphone", "scale": 2, "role": "app" },
    { "filename": "app-icon-80.png",   "size": 80,   "idiom": "iphone", "scale": 2, "role": "spotlight" },
    { "filename": "app-icon-60.png",   "size": 60,   "idiom": "iphone", "scale": 3, "role": "settings" },
    { "filename": "app-icon-40.png",   "size": 40,   "idiom": "iphone", "scale": 2, "role": "spotlight" },
    { "filename": "app-icon-29.png",   "size": 29,   "idiom": "iphone", "scale": 2, "role": "settings" }
  ]
}
```

Block 5 reads this, generates `apps/ios/Runtime/Assets.xcassets/AppIcon.appiconset/Contents.json` from it, copies the PNGs into the appiconset folder. That's a ten-line script; happens once per asset refresh. The PNGs and the manifest are the durable artefact; the catalog binding is the consumer.

### 4. Verification — `scripts/verify-icons.mjs`

Renders the seven PNGs at 4× zoom side-by-side into a single comparison sheet at `dist/icons/_verify.png`. The 4× zoom is what makes the 29×29 visible at all — at native resolution on a Retina display, a 29px icon is ~14 actual pixels tall and the eye can't resolve the dot's pixel-boundary alignment. At 4× (116px rendered) the pixel boundaries are clearly visible and the inspection is unambiguous.

```javascript
import sharp from 'sharp'

const sizes = [29, 40, 60, 80, 120, 180]   // skip 1024 — too big for the sheet
const zoom = 4
const padding = 16
const labelHeight = 24

// Build a composite: each icon scaled up 4×, padded, labeled with its size.
// Use sharp's composite() with a base canvas sized to fit all of them in a row.
// ...
```

The verify sheet is a *snapshot of the pitch's correctness* — open it in Preview, look at every dot, confirm each one is on a pixel boundary. Commit the sheet too; future-Luk regenerating the icons can diff against the committed version to spot regressions visually.

### 5. README update — handoff documentation

Append to `packages/design-tokens/README.md`:

> ### Regenerating the app icons
>
> The master icon SVG is at `icons/app-icon.svg` (1024×1024 native, three parametric elements). To regenerate the PNG export for every Apple-required size:
>
> ```sh
> node packages/design-tokens/scripts/generate-icons.mjs
> ```
>
> Outputs go to `dist/icons/` along with a `MANIFEST.json` listing each size's intended catalog binding. The script depends on `sharp` (declared in `packages/design-tokens/package.json`).
>
> After regenerating, run the verification:
>
> ```sh
> node packages/design-tokens/scripts/verify-icons.mjs
> ```
>
> Open `dist/icons/_verify.png` in Preview. Confirm the amber dot is on a pixel boundary at every size — particularly at 29×29 (the smallest size; the dot is ~4 pixels here and any subpixel smear is visible).
>
> ### Block 5 handoff
>
> When `apps/ios/` exists, block 5's first pitch consumes this pipeline:
>
> 1. Generate or hand-write `apps/ios/Runtime/Assets.xcassets/AppIcon.appiconset/Contents.json` from `dist/icons/MANIFEST.json` — the manifest carries `idiom`, `scale`, `role`, and `filename` for every entry.
> 2. Copy `dist/icons/app-icon-*.png` into the appiconset folder.
> 3. Reference `AppIcon` from the iOS target's primary app-icon setting.
>
> Don't hand-edit the PNGs in `Assets.xcassets`. If a re-export is needed, change `icons/app-icon.svg`, run `generate-icons.mjs`, copy the new PNGs in. The master SVG is the source.

## Out of scope

- **The `Assets.xcassets` placement and `Contents.json` wiring.** Belongs to block 5 — there's no `apps/ios/` to place them into yet. This pitch's MANIFEST.json makes the block 5 step a five-minute job.
- **Dark mode / tinted icon variants.** iOS 18's tinted-icon and dark-mode-icon support is a nice-to-have, not a launch requirement. The default icon works in both modes; tinted/dark variants are a follow-up pitch (most likely sized at *an evening* once block 5's icon wiring exists to drop the variants alongside the default).
- **macOS / iPadOS-specific sizes.** The pilot is iOS-iPhone-only ([[../../product-design/003-pilot-scope]]). iPad and Mac Catalyst icon sizes (76, 83.5, 152, 167) are out of scope until the platform target expands.
- **App Store metadata images** (1242×2688 screenshots, App Preview videos, marketing graphics). Those are App Store Connect assets, not app icon assets. Belong to [[blocks/07-launch-and-recruitment]] or a launch-prep pitch.
- **Favicon for the website.** Web favicon is a different export (16, 32, 192, 512 for various web contexts, plus `apple-touch-icon` for "Add to Home Screen"). The same master SVG could feed it via a parallel export step, but that's block 2 territory. Out of scope here. The icon and favicon may diverge slightly (favicon at 16×16 may want different proportions to read at all); decide then.
- **An icon design variation** (different shape, different dot position, different color). The icon is settled in 004 §1; this pitch implements it, doesn't redesign it.
- **A `package.json` for the design-tokens package.** The package still doesn't have one (per [[shipped/design-tokens-single-source-of-truth]] — *"no `package.json` in the package yet because the monorepo scaffold hasn't landed"*). This pitch adds `sharp` as a dependency by adding it at the monorepo-root `package.json` until the package has its own. Block 2 settles the package structure.
- **Tests beyond visual verification.** The generator is deterministic, the export is byte-identical on re-run, and visual correctness is the actual quality bar. A unit test on the manifest schema would catch nothing the verify sheet doesn't catch first.

## Risks / unknowns

- **The 29×29 dot is the make-or-break test.** At 29px output, the dot is ~4.5px diameter — `r=80` at 1024 scales to ~`r=2.27` at 29. Sharp's `lanczos3` downscale will antialias this; the dot will be a few semi-transparent pixels with a one-or-two-pixel solid core. If the solid core lands on the center pixel cleanly, the icon reads correctly. If it smears across two columns at half-strength each, it looks like a rendering bug. **This is the one thing that has to actually be verified visually**; the math says it should work, but I want eyes on the output before declaring ship. Mitigation: the verify sheet at 4× zoom makes the inspection trivial. If the 29×29 dot is wrong, the recovery is to nudge `r=80` to `r=82` or `r=78` in the master SVG and re-export — both lie just on the other side of the boundary case. Five minutes if the math at 1024 was almost-right.
- **Sharp is a native dependency** (libvips under the hood). It's well-maintained and `npm install sharp` works on macOS and Linux without ceremony, but it's the first non-stdlib dep the design-tokens package takes on. Mitigation: it's a dev-time dep only (the consuming app never runs `sharp`); the generated PNGs are what ships. If sharp ever becomes painful, swap it for ImageMagick via shell-out, or `@resvg/resvg-js` (Rust-native, sometimes cleaner). Both are 30-minute migrations.
- **The icon's three values (`width=40`, `height=384`, `r=80`) are tuned to round well at the listed Apple sizes — but Apple may add new required sizes** (the App Store icon went from 512 to 1024 in 2018; could shift again). Mitigation: the parametric design means a new size is just one entry in `SIZES` and a re-run. The geometry's tuned for *integer-pixel rounding*, which holds at any size; only the antialiasing character changes.
- **The amber dot at 1024 is 160px diameter — significantly larger relative to the icon than what 004 §1's `App icon` section visually suggests in the SVG it references** (`004-design-system.svg`). The 004 SVG might show a smaller dot. Mitigation: open the 004 SVG side-by-side with the 1024 render at the start of the pitch and visually confirm. If the dot needs to shrink, adjust `r` and re-verify the rounding behavior at small sizes. The pixel-boundary discipline must survive the adjustment.
- **The icon background being `#0D1014` (full Inkt) means the icon is "very black" on a typical iOS home screen.** Apple's HIG warns against pure-black icons because they can look like a hole. Inkt isn't pure black (`#0D1014` carries a touch of warmth) but it's close. Mitigation: this is a brand decision settled in 004 §1, not a HIG decision. If the icon ever reads wrong on user devices, the answer is to lift the background ~3% toward Houtskool (`#3A4A52`) — a brand-conversation, not a pitch-decision. Flagged so block 5 knows where to check first if user feedback raises it.
- **No `apps/ios/` means this pitch ships outputs that nothing consumes for the next ~5 blocks.** The work is real and useful but its consumer is months away. The risk is the master SVG gets out-of-date by the time block 5 picks it up (a design tweak, a color adjustment, a follow-up to 004). Mitigation: the regeneration step is documented and one-command; if the design shifts before block 5, re-running the export is faster than re-authoring would be. The pipeline's value is more durable than the specific PNGs.
- **Committing the verify sheet adds ~50kb to the repo per export.** Mitigation: small enough to live in git long-term; reviewable diffs are worth more than the size. If it ever bloats, drop the verify sheet from the commit and require contributors to regenerate it locally before declaring an export correct.

## Related

- Block: [[blocks/01-brand-system-in-code]]
- Design source: [[../../product-design/004-design-system-and-screens#App icon]]
- Pattern precedent: [[shipped/wordmark-as-component]] — same `master-SVG → generator-script → dist/{thing}` pipeline. The icon is structurally simpler (no path outlining; just geometric primitives) but uses the same scaffolding.
- Token consumer: [[shipped/design-tokens-single-source-of-truth]] — `Inkt`, `Krijt`, `Eerste licht` (colors hardcoded as hex in the master SVG since SVG `fill` doesn't read CSS vars at static-export time; values match the tokens).
- iOS handoff: [[blocks/05-ios-app-downsized]] — inherits the `dist/icons/` folder and the manifest. The catalog wiring is a five-minute pitch-slot inside block 5, not a full pitch.
- Adjacent: [[blocks/02-website-foundation]] — favicon for the web; parallel pipeline against the same master SVG when that pitch lands.

---

## What actually happened

**Draft from the diff — Luk to edit.**

Shipped the full default path, no cuts. Master SVG at `packages/design-tokens/icons/app-icon.svg` — the three-element 1024×1024 authored per the pitch's geometry table (tick `40×384`, dot `r=80`, centered at 512,512). Generator at `scripts/generate-icons.mjs` rasterizes the SVG once at 2048×2048 via `sharp` then downscales to all seven sizes with `lanczos3`. Caught one issue mid-build: my first cut set sharp's `density` per-target which pushed the 1024 raster past the 268M pixel-limit; rewrote to render once at 2× the largest size and downscale from a single master buffer. Manifest written as `dist/icons/MANIFEST.json` with `idiom`/`scale`/`role` per entry. Verify sheet at `dist/icons/_verify.png` is a 4512×796 strip of the six non-1024 sizes at 4× zoom with labels — visual inspection confirms the amber dot is sharp at 29×29 (~4–5px), no smearing, the tick reads as a deliberate stroke at every size.

Sharp added to `packages/design-tokens/devDependencies` (`^0.34.0`). The pitch warned this would be the package's first dep — it's actually the second since `opentype.js` from the wordmark pitch is already there. Same posture: dev-time only, never consumed at runtime.

Worth watching: the 1024 dot may read slightly larger relative to the canvas than the 004 sketch SVG suggests (the pitch flagged this risk). Eyeball check at 180 looks right against the brand context, but if a final side-by-side against `004-design-system.svg` says "shrink it", adjusting `r=80` down to `r=72` is one number + a re-export.

**Block 1 is now fully shipped.** All 5 slots landed. The five-minute `Assets.xcassets` wiring waits for block 5.
