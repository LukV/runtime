# `@runtime/design-tokens`

The single source of truth for runtime's color, spacing, type, and motion tokens. Everything in [[../../docs/product-design/004-design-system-and-screens#1. The system]] in executable form.

Both `apps/web/` and `apps/ios/` consume from here so the brand can't drift across surfaces.

## The contract

1. **Edit only `tokens.json`.** Never edit anything in `dist/`.
2. **Run the generator after every edit.** Outputs in `dist/` are committed so Vercel and Xcode don't need Node at build time.
3. **Token names match `004-design-system-and-screens.md` §1 exactly.** Dutch stays Dutch (`eerste-licht`, not `first-light`). New tokens not in §1 need a §1 update first.
4. **Generated files carry `AUTO-GENERATED FROM tokens.json — DO NOT EDIT` at the top.** A pre-commit hook enforcing this is on the wishlist; for now the README is the rule.

## Running the generator

For now (no monorepo scaffold yet — see [[../../docs/planning/blocks/02-website-foundation]]):

```sh
node packages/design-tokens/scripts/generate.mjs
```

Once Block 2's `Monorepo + Next.js + Supabase scaffold` lands and this is a workspace package, the canonical command becomes:

```sh
npm run generate -w packages/design-tokens
```

Both produce byte-identical output. The script has no external dependencies.

## What gets generated

- `dist/tokens.css` — CSS custom properties on `:root`. Imported once by `apps/web/`'s global stylesheet.
- `dist/tokens.ts` — typed TypeScript exports (`color`, `spacing`, `type`, `motion`). For Tailwind config, CSS-in-JS, or anywhere TS code needs the values.
- `dist/Tokens.swift` — `Color` extensions, `Spacing` enum, `Motion` enum for SwiftUI. The iOS app reads this file via an Xcode build-phase script (wired in Block 5).
- `dist/wordmark.svg` — the runtime wordmark outlined from Source Serif 4 Medium with the amber period as a separate `<circle>`. Hand-readable SVG, useful for design-tool inspection.
- `dist/wordmark.ts` — the same wordmark as TypeScript: `WORDMARK_PATH`, `WORDMARK_PERIOD`, `WORDMARK_VIEWBOX`. Consumed by `apps/web/app/_components/Wordmark.tsx` and (eventually) the SwiftUI Wordmark in Block 5.
- `dist/ribbon.ts` — geometry constants (`RIBBON_VIEWBOX`, `RIBBON_GEOMETRY`) and a `ribbonTicks()` helper for the race ribbon. Consumed by `apps/web/app/_components/Ribbon.tsx`; the future SwiftUI Ribbon reads the same source.
- `dist/icons/app-icon-{29,40,60,80,120,180,1024}.png` + `MANIFEST.json` — Apple-required app-icon sizes rasterized from `icons/app-icon.svg`. Block 5 consumes the manifest to wire `Assets.xcassets`.
- `dist/icons/_verify.png` — every non-1024 PNG scaled 4× and laid out side-by-side. Visual proof the amber dot is sharp at 29×29.

Type tokens are deliberately **not** in `tokens.css` — they're too compound for CSS variables. Consumers reach for `tokens.ts`.

## Regenerating the wordmark

`dist/wordmark.svg` and `dist/wordmark.ts` come from outlining Source Serif 4 Medium glyphs. **Run rarely** — the wordmark rarely changes, the SVG is committed, and the source font is not in the repo.

When you do need to regenerate (font version bump, tracking adjustment, swap to a different family):

```sh
# Download the variable font (not committed)
curl -L -o /tmp/SourceSerif4Variable-Roman.ttf \
  https://raw.githubusercontent.com/adobe-fonts/source-serif/release/VAR/SourceSerif4Variable-Roman.ttf

# Instance at weight 500 (Medium) using fontTools (Python — uv tool install fonttools once)
uvx --from fonttools fonttools varLib.instancer \
  -o /tmp/SourceSerif4-Medium-instance.ttf \
  /tmp/SourceSerif4Variable-Roman.ttf wght=500 opsz=26

# Regenerate
FONT_PATH=/tmp/SourceSerif4-Medium-instance.ttf \
  npm run generate:wordmark -w packages/design-tokens

# Clean up
rm /tmp/SourceSerif4Variable-Roman.ttf /tmp/SourceSerif4-Medium-instance.ttf
```

The script lives at `scripts/generate-wordmark.mjs` and uses `opentype.js` (the only devDep). Source Serif 4 Medium static OTF is not directly available in the canonical repo — only the variable font — so the fontTools instancing step is required.

## Regenerating the app icons

The master icon SVG is at `icons/app-icon.svg` (1024×1024 native, three parametric elements per 004 §1 — ink ground, vandaag tick, amber dot). To regenerate the PNG export for every Apple-required size:

```sh
npm run generate:icons -w packages/design-tokens
```

Outputs go to `dist/icons/` along with `MANIFEST.json` listing each size's intended catalog binding. The script depends on `sharp` (declared as a devDep).

After regenerating, build the verification sheet:

```sh
npm run verify:icons -w packages/design-tokens
```

Open `dist/icons/_verify.png` in Preview. Confirm the amber dot is sharp at every size — particularly at 29×29 where the dot is ~4 pixels and any subpixel smear is visible. If the dot looks wrong at 29×29, nudge `r=80` to `r=78` or `r=82` in `icons/app-icon.svg` and re-export.

### Block 5 handoff

When `apps/ios/` exists, block 5's first pitch consumes this pipeline:

1. Generate or hand-write `apps/ios/Runtime/Assets.xcassets/AppIcon.appiconset/Contents.json` from `dist/icons/MANIFEST.json` — the manifest carries `idiom`, `scale`, `role`, and `filename` for every entry.
2. Copy `dist/icons/app-icon-*.png` into the appiconset folder.
3. Reference `AppIcon` from the iOS target's primary app-icon setting.

Don't hand-edit the PNGs in `Assets.xcassets`. If a re-export is needed, change `icons/app-icon.svg`, run `generate:icons`, copy the new PNGs in. The master SVG is the source.

## Naming

| Surface | Convention | Example |
|---|---|---|
| `tokens.json` (canonical) | kebab-case | `eerste-licht` |
| CSS custom properties | kebab-case with `--color-` / `--space-` / `--motion-` prefix | `--color-eerste-licht` |
| TypeScript exports | matches JSON keys | `color["eerste-licht"]` |
| Swift static lets | lowerCamelCase | `Color.eersteLicht` |

The kebab → camel mapping happens in the generator, so the JSON key is the only place a name needs to be decided.

## How fonts connect

The `type` tokens name font families (`Source Serif 4`, `Inter`, `JetBrains Mono`). The fonts themselves are integrated separately — in `apps/web/app/layout.tsx` via `next/font` (Inter Variable self-hosted from rsms; Source Serif 4 and JetBrains Mono via `next/font/google`, which in Next 15 self-hosts at build time). iOS bundles Inter and JetBrains Mono only — Source Serif lives as an inline SVG on iOS, never as a font (resolved in [[font-integration]] and [[wordmark-as-component]]). If you add or change a font, update *both* this token file and the platform-specific integration.

## Out of scope (v0)

- Light/dark theme variable layers — keep `Stof` and `Nacht` as separate flat tokens; theme abstraction wraps later.
- Style Dictionary or any DSL — a ~80-line Node script does the job.
- Per-component tokens (`button-bg`, `card-border`) — system is primitive-tokenized for now.
- Token versioning — git history is the version history.
- Figma sync — code → docs, not Figma → code.
