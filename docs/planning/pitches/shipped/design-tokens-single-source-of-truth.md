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
# Design tokens as the single source of truth

## Problem

The design system in [[../../product-design/004-design-system-and-screens#1. The system|004 §1]] exists as prose plus a couple of SVGs. Colors are named in Dutch (`Inkt`, `Krijt`, `Eerste licht`, `Veldgroen`), the spacing scale is `4 · 8 · 12 · 16 · 22 · 30 · 36 · 44`, motion is *220ms ease-out, no bounce*, and type sizes are documented in a table. None of that exists in code yet.

The risk is the obvious one: the moment block 2 starts (website foundation), someone — Claude Code or Luk at 23:00 — types `color: #E8A65A` into a stylesheet because the hex is what's at hand. The next file types `#e8a65a`. The iOS app, when it lands, defines its own `Color.eersteLicht = Color(red: 0.91, green: 0.65, blue: 0.35)` rounded differently. Inside a fortnight the dot is three slightly different ambers across web and iOS and nobody notices until they're side by side. The whole *one accent, one color, three jobs* discipline in 004 §1 quietly dies.

The same applies to spacing (someone uses `padding: 20px` because 22 felt off), to motion (someone reaches for the system spring), and especially to the Dutch token names — if they're not codified somewhere, English names creep in and the brand register weakens by a thousand cuts.

The fix is a single tokens source that both `apps/web/` and `apps/ios/` read from. Monorepo already sets `packages/design-tokens/` aside for this ([[../../architecture/001-stack-decisions#Monorepo structure]]); this pitch fills it.

## Appetite

**An evening.** Cap is binding. The pitch ships:

1. `packages/design-tokens/tokens.json` — the canonical source, every color, spacing step, type role, and motion timing from 004 §1 named in Dutch.
2. A generated `tokens.css` with CSS custom properties on `:root` for web consumption.
3. A generated `Tokens.swift` (or `tokens.json` consumed by an Xcode build-phase script) so the iOS app can `Color.eersteLicht` directly.
4. A `packages/design-tokens/README.md` that tells Claude Code exactly how to add a new token and where the generated outputs go.

If the evening runs out, cuts in this order:

1. **iOS Swift generation drops first.** Ship the JSON + the CSS. iOS reads the JSON from `tokens.json` directly via a build-phase script when block 5 picks up — that block is months away, the wiring can wait. Web is the immediate consumer.
2. **The generator script becomes hand-maintained `.css` and `.swift` files.** Same content, same names, no codegen — Claude Code edits both files when a token changes. Doubles the work on a token change but the change is a one-line PR either way. Acceptable for v0.
3. **Motion and type-role tokens drop.** Ship colors and spacing only. Motion is two numbers (220ms, ease-out), type is documented in 004 §1 — both are quotable inline until block 2 actually needs them. Colors are the urgent ones.

The non-negotiable is *`tokens.json` exists, names match 004 §1, and `apps/web/` can import a CSS file or TS module that gives it the palette*. Everything else is cuttable.

## Sketch

Four pieces.

### 1. `tokens.json` — the canonical source

Lives at `packages/design-tokens/tokens.json`. Flat structure, Dutch names everywhere they're Dutch in 004 §1. JSON because both web (TS) and iOS (Swift via JSON decoder) can read it natively — no DSL, no Style Dictionary, no extra build step beyond the codegen below.

```json
{
  "color": {
    "veldgroen": "#7B9D7A",
    "eerste-licht": "#E8A65A",
    "inkt": "#0D1014",
    "krijt": "#F6F5F1",
    "mist": "#6B7680",
    "stof": "#EFEDE5",
    "nacht": "#1B2531",
    "steen": "#8C8678",
    "houtskool": "#3A4A52"
  },
  "spacing": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 22,
    "6": 30,
    "7": 36,
    "8": 44
  },
  "type": {
    "wordmark": {
      "family": "Source Serif 4",
      "weight": 500,
      "tracking": "-0.02em",
      "size-header": 26,
      "size-splash": 38
    },
    "display": {
      "family": "Inter",
      "weight": 700,
      "tracking": "-0.04em",
      "size-min": 52,
      "size-max": 56
    },
    "body": {
      "family": "Inter",
      "weight": 400,
      "size": 17
    },
    "label": {
      "family": "Inter",
      "weight": 500,
      "tracking": "0.15em",
      "size-min": 10,
      "size-max": 11
    },
    "numeric": {
      "family": "JetBrains Mono",
      "weight": 500,
      "tracking": "-0.04em",
      "size-min": 14,
      "size-max": 56
    }
  },
  "motion": {
    "transition": "220ms ease-out"
  }
}
```

The `display` and `numeric` roles carry a size range, not a single number — these are role tokens with context-dependent sizing in 004 §1, and forcing them to one number now would lie about the system. Web consumers pick from the range; iOS does the same.

### 2. `tokens.css` — generated CSS custom properties

Generated from `tokens.json` by `packages/design-tokens/scripts/generate.mjs`. Output at `packages/design-tokens/dist/tokens.css`. Web (`apps/web/`) imports this file in its global stylesheet — once.

```css
:root {
  --color-veldgroen: #7B9D7A;
  --color-eerste-licht: #E8A65A;
  --color-inkt: #0D1014;
  --color-krijt: #F6F5F1;
  --color-mist: #6B7680;
  --color-stof: #EFEDE5;
  --color-nacht: #1B2531;
  --color-steen: #8C8678;
  --color-houtskool: #3A4A52;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 22px;
  --space-6: 30px;
  --space-7: 36px;
  --space-8: 44px;

  --motion-transition: 220ms ease-out;
}
```

Type tokens are *not* expressed as CSS variables — they're too compound. Instead, the generator emits a `tokens.ts` alongside `tokens.css` exporting them as a typed object for Tailwind/CSS-in-JS consumers, and 004 §1's table stays the authoritative reference for "the wordmark is 26pt header, 38pt splash". The generator should produce both files in one pass.

### 3. `Tokens.swift` — generated Swift for iOS

Emitted to `packages/design-tokens/dist/Tokens.swift`. The iOS Xcode project adds a build-phase script that copies this file into `apps/ios/Runtime/Generated/` at build time. Same names as `tokens.json`, lowerCamelCased for Swift convention (`eersteLicht`, not `eerste-licht`).

```swift
import SwiftUI

extension Color {
  static let veldgroen     = Color(hex: 0x7B9D7A)
  static let eersteLicht   = Color(hex: 0xE8A65A)
  static let inkt          = Color(hex: 0x0D1014)
  static let krijt         = Color(hex: 0xF6F5F1)
  static let mist          = Color(hex: 0x6B7680)
  static let stof          = Color(hex: 0xEFEDE5)
  static let nacht         = Color(hex: 0x1B2531)
  static let steen         = Color(hex: 0x8C8678)
  static let houtskool     = Color(hex: 0x3A4A52)
}

enum Spacing {
  static let s1: CGFloat = 4
  static let s2: CGFloat = 8
  static let s3: CGFloat = 12
  static let s4: CGFloat = 16
  static let s5: CGFloat = 22
  static let s6: CGFloat = 30
  static let s7: CGFloat = 36
  static let s8: CGFloat = 44
}

enum Motion {
  static let transition = Animation.easeOut(duration: 0.22)
}
```

The `Color(hex:)` helper isn't a Swift stdlib initializer — it's a small extension that goes in the same file. Generator emits it once at the top of `Tokens.swift`.

### 4. The generator and the contract

`packages/design-tokens/scripts/generate.mjs` is a single Node script. Reads `tokens.json`, writes `dist/tokens.css`, `dist/tokens.ts`, `dist/Tokens.swift`. No external dependencies — pure Node, just `fs` and template strings. Adds an npm script: `npm run generate -w packages/design-tokens`.

The contract for Claude Code is in `packages/design-tokens/README.md`:

- Edit only `tokens.json`. Never edit files in `dist/`.
- Run `npm run generate -w packages/design-tokens` after every edit. The generated files are committed to git (so Vercel and Xcode don't need Node to build) and the script is idempotent — re-running produces byte-identical output if `tokens.json` hasn't changed.
- Token names match 004 §1 exactly. Dutch names stay Dutch. New tokens that don't appear in 004 §1 need a 004 update first.
- The generated files carry a header comment: `// AUTO-GENERATED FROM tokens.json — DO NOT EDIT`. Pre-commit hook reading that header and rejecting hand-edits is reserved for later — for v0, the README is the contract.

## Out of scope

- **Theme switching / light + dark variable layers.** 004 §1 names light-mode and dark-mode surfaces (`Stof` and `Nacht`) but treats them as separate tokens, not as a `surface-card` variable that swaps. v0 keeps it flat. The theme-switching abstraction can wrap the flat tokens later without re-shaping them.
- **Style Dictionary or any token tool with a DSL.** A 40-line Node script does the same job for this scope. Adopt Style Dictionary the day we need platform-specific transformations the script can't handle in twenty lines.
- **Per-component tokens** (`button-bg`, `card-border`). The system in 004 §1 isn't component-tokenized — it's primitive-tokenized. Layering component tokens on top happens when we have enough components to see the patterns; not now.
- **Animation library setup** (Framer Motion, Lottie, Rive). The single `--motion-transition` token is the whole motion system v0 needs. Anything fancier is a future pitch.
- **Tailwind config integration.** If block 2 ([[02-website-foundation]]) picks Tailwind, that pitch wires `tokens.ts` into `tailwind.config.ts`. Not this pitch's job to anticipate the styling layer.
- **Token versioning / changelog.** `tokens.json` is in git; that's the version history v0 needs.
- **Figma / design-tool sync.** Tokens flow code → docs, not Figma → code. The design lives in 004 §1; the tokens are the executable form of that prose. If a Figma library exists later, it imports from `tokens.json`, not the other way around.

## Risks / unknowns

- **The Dutch-named tokens are fine for web (CSS vars are arbitrary strings) but ugly in Swift.** `Color.eersteLicht` reads okay; `Color.eerste-licht` doesn't compile. The generator lowerCamelCases on the way out, which means there's one canonical name (the JSON key in kebab-case) and one platform-adapted name (Swift's camelCase, web's kebab-case). Risk: a future contributor adds a token in Swift directly and the names drift. Mitigation: the README contract calls this out, and the generated Swift carries `// AUTO-GENERATED` at the top. Acceptable for v0.
- **The `type` tokens are not as load-bearing as the color tokens.** Type sizes in 004 §1 are role-driven (display, body, label) and most production code will reach for the role, not the number. A future CSS-in-JS or Tailwind setup might want different role names (`text-display`, `text-body`) that don't map 1:1 to the token shape. Mitigation: `tokens.ts` exports both the JSON shape and a flatter role-keyed object, so consumers can pick. If both end up unused, drop the type tokens entirely and let 004 §1 be the reference.
- **Generated files in git is unusual.** The argument for it is that Vercel and Xcode shouldn't need Node to build — Vercel's Next.js build doesn't run our generator script. The argument against is that PRs touching `tokens.json` carry three diff files for one logical change. Mitigation: a single pre-commit hook running `generate.mjs` and `git add dist/` would solve this cleanly later; for v0 the README contract (*"run the generator before commit"*) is the rule.
- **The wordmark font reference (`Source Serif 4`) in `tokens.json` is currently aspirational** — the font isn't installed yet. That's [[font-integration]]'s job. This pitch ships the *name* in the token; consumers seeing `font-family: var(--font-wordmark)` before block 2 falls back to whatever the browser does. Not a real risk — both pitches ship in the same block — but worth noting that color tokens are usable on day one, type tokens earn their keep once fonts land.
- **No tests.** The generator is small enough that a snapshot of `dist/tokens.css` against a fixture `tokens.json` would catch regressions in one line of jest, but v0 ships without — the contract is "run it, look at the output, commit." If the generator grows past 50 lines, add a snapshot test.

## Related

- Block: [[blocks/01-brand-system-in-code]]
- Design source: [[../../product-design/004-design-system-and-screens#1. The system]]
- Sibling pitches in this block:
  - [[font-integration]] — installs the fonts the type tokens name.
  - [[wordmark-as-component]] — first consumer of `--color-eerste-licht` and the wordmark type role.
- Stack: [[../../architecture/001-stack-decisions#Monorepo structure]] — `packages/design-tokens/` is already reserved in the tree.
- Downstream consumers (every other block): [[02-website-foundation]], [[03-race-calendar]], [[04-pilot-intake]], [[05-ios-app-downsized]].

---

## What actually happened

> *Stub drafted by Claude from the diff — Luk to edit before next ship.*

Shipped the full appetite inside the evening. `packages/design-tokens/tokens.json` carries every color, spacing step, type role, and motion value from 004 §1, Dutch names intact. The generator (`scripts/generate.mjs`) is ~85 lines of pure Node — no deps, idempotent (second run produces byte-identical output, verified). Outputs all three artefacts in one pass: `dist/tokens.css` (CSS custom properties on `:root`), `dist/tokens.ts` (typed exports of `color`/`spacing`/`type`/`motion`), `dist/Tokens.swift` (a `Color(hex:)` initializer plus the `Color` extension, `Spacing` enum, `Motion` enum).

What was cut: nothing from the pitch's appetite, but two pieces deliberately left for later — (a) no `package.json` in the package yet because the monorepo scaffold ([[02-website-foundation]]) hasn't landed; the README documents `node packages/design-tokens/scripts/generate.mjs` as the v0 invocation and `npm run generate -w packages/design-tokens` as the post-Block-2 canonical form; (b) no pre-commit hook enforcing the "don't edit `dist/`" rule — the README is the contract, hook can come when something actually edits the generated files by accident.

What to watch: the `eerste-licht` ↔ `eersteLicht` ↔ `--color-eerste-licht` name fan-out is the one place drift could sneak in if a contributor goes around the generator. Mitigation is in the generated headers (`AUTO-GENERATED FROM tokens.json — DO NOT EDIT`) and the README — but if iOS code starts referencing colors directly without going through the generated file, that's the moment to add the pre-commit hook.

No surprises. Release step skipped per agreement (no commitizen wired up; first ship is pre-version).
