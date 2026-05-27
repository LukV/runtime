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

Type tokens are deliberately **not** in `tokens.css` — they're too compound for CSS variables. Consumers reach for `tokens.ts`.

## Naming

| Surface | Convention | Example |
|---|---|---|
| `tokens.json` (canonical) | kebab-case | `eerste-licht` |
| CSS custom properties | kebab-case with `--color-` / `--space-` / `--motion-` prefix | `--color-eerste-licht` |
| TypeScript exports | matches JSON keys | `color["eerste-licht"]` |
| Swift static lets | lowerCamelCase | `Color.eersteLicht` |

The kebab → camel mapping happens in the generator, so the JSON key is the only place a name needs to be decided.

## How fonts connect

The `type` tokens name font families (`Source Serif 4`, `Inter`, `JetBrains Mono`). The fonts themselves are integrated separately — in `apps/web/app/layout.tsx` via `next/font/local` and in `apps/ios/Runtime/Fonts/` via `Info.plist` registration. If you add or change a font, update *both* this token file and the platform-specific integration. See [[../../docs/planning/pitches/font-integration]].

## Out of scope (v0)

- Light/dark theme variable layers — keep `Stof` and `Nacht` as separate flat tokens; theme abstraction wraps later.
- Style Dictionary or any DSL — a ~80-line Node script does the job.
- Per-component tokens (`button-bg`, `card-border`) — system is primitive-tokenized for now.
- Token versioning — git history is the version history.
- Figma sync — code → docs, not Figma → code.
