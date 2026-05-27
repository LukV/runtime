---
project: runtime
type: pitch
status: shipped
area: website
block: website-foundation
appetite: an evening
created: 2026-05-27
started: 2026-05-27
shipped_on: 2026-05-27
---
# Monorepo + Next.js + Supabase scaffold

## Problem

Block 1's [[design-tokens-single-source-of-truth]] just shipped — `packages/design-tokens/` exists, `tokens.css` and `tokens.ts` are generated and waiting to be consumed. But there's no consumer. There's no `apps/web/`, no `package.json` at the repo root, no Tailwind config, no Next.js project. The tokens have a contract but no caller.

[[font-integration]] is next on the list and the first line of its sketch references `apps/web/app/layout.tsx`. [[wordmark-as-component]] wants `apps/web/app/_components/Wordmark.tsx`. Both pitches assume the monorepo skeleton from [[../../architecture/001-stack-decisions#Monorepo structure]] exists. It doesn't.

The risk if we keep pushing tokens, then fonts, then wordmark without the scaffold is that each of those pitches grows a *"...and also set up Next.js"* tail and silently overflows its appetite. Better to take the scaffold pitch from [[02-website-foundation]] out of order and pay it once. After this lands, every subsequent Block 1 and Block 2 pitch lives inside a working web app and a real npm workspace.

This is also the pitch that wires `packages/design-tokens/` into a workspace — the tokens pitch deliberately deferred the `package.json` wrap because it didn't yet have a workspace to belong to. This pitch closes that loop.

## Appetite

**An evening.** Cap is binding. The pitch ships:

1. **Workspaces root** — `package.json` at the repo root with `"workspaces": ["apps/*", "packages/*"]`, `.gitignore`, `.nvmrc` (or `engines.node`), and a README at the root that explains the layout.
2. **`apps/web/`** — Next.js 15+, App Router, TypeScript, Tailwind 4. Runs locally with `npm run dev -w apps/web`. Imports `packages/design-tokens/dist/tokens.css` in the global stylesheet. Renders one page (the placeholder home) that visibly proves the tokens are loaded — the page background uses `var(--color-krijt)`, the text uses `var(--color-inkt)`, a small amber dot uses `var(--color-eerste-licht)`. No design ambition; this is a smoke screen.
3. **`packages/design-tokens/package.json`** — wraps the existing files as a real workspace package, name `@runtime/design-tokens`. The generator script is exposed as `npm run generate -w packages/design-tokens` (the README's already-canonical command finally works).
4. **ESLint + Prettier at the root** — one config each, shared across all workspaces. ESLint's Next.js plugin extended in `apps/web/`. Prettier with the defaults that match the design brief's calm tone (no semicolons-everywhere debates today; pick a side and lock it).
5. **Supabase skeleton** — `supabase/migrations/` and `supabase/seed.sql` exist (empty files). `apps/web/.env.example` lists `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` so the next pitch that needs them knows the contract. No `@supabase/supabase-js` client wiring this evening — nothing needs it yet.

If the evening runs out, cuts in this order:

1. **Supabase skeleton drops entirely.** Defer to whichever pitch first reads or writes the database. The architecture doc names Supabase; the directory can land in five minutes whenever it's actually needed.
2. **ESLint + Prettier shared config drops to apps/web only.** Move the configs into `apps/web/` rather than the root. Cross-workspace consistency is a problem we don't have yet (one workspace exists). Promote to root when `apps/api/` and `apps/ios/` arrive.
3. **`packages/design-tokens/package.json` drops.** The package keeps running via `node packages/design-tokens/scripts/generate.mjs` per its current README. Tailwind imports the tokens via a relative path (`../../packages/design-tokens/dist/tokens.css`) rather than via the workspace alias. Ugly but works. Wrap it as a package the day a second consumer needs it.

The non-negotiable is *`apps/web/` runs locally with `npm run dev`, renders one page styled with tokens from `packages/design-tokens/dist/tokens.css`, and the workspace `npm install` from the root works clean.*

## Sketch

Five pieces, in execution order.

### 1. Workspace root

`package.json` at `/`:

```json
{
  "name": "runtime",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev -w apps/web",
    "build": "npm run build -w apps/web",
    "lint": "npm run lint -w apps/web",
    "typecheck": "npm run typecheck -w apps/web",
    "generate:tokens": "npm run generate -w packages/design-tokens"
  },
  "devDependencies": {
    "prettier": "^3",
    "eslint": "^9"
  },
  "engines": {
    "node": ">=20.11"
  }
}
```

Plus `.gitignore` (Node + Next.js + macOS + Xcode standards), `.nvmrc` (`20.11` or whatever's current LTS), and a top-level `README.md` that names the workspace layout and the *"run `npm install` then `npm run dev`"* invocation.

### 2. `packages/design-tokens/package.json`

Minimal:

```json
{
  "name": "@runtime/design-tokens",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./tokens.css": "./dist/tokens.css",
    "./tokens.ts": "./dist/tokens.ts",
    "./tokens.json": "./tokens.json"
  },
  "scripts": {
    "generate": "node scripts/generate.mjs"
  }
}
```

The `exports` map means `apps/web/` can `import '@runtime/design-tokens/tokens.css'` cleanly. The Swift artefact stays unimported (iOS reads via build-phase script in Block 5, not via npm).

### 3. `apps/web/` — Next.js 15+, App Router, TypeScript, Tailwind 4

Scaffolded fresh, not via `create-next-app` (which adds opinions we'd then need to undo). Hand-crafted minimum:

```
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts        (or `app/globals.css` @theme block in TW4)
├── package.json
└── .env.example
```

`apps/web/package.json` lists Next 15, React 19, TypeScript, Tailwind 4, `@runtime/design-tokens` as a workspace dep.

`app/globals.css`:

```css
@import "@runtime/design-tokens/tokens.css";
@import "tailwindcss";

@theme {
  --color-inkt: var(--color-inkt);
  --color-krijt: var(--color-krijt);
  --color-eerste-licht: var(--color-eerste-licht);
  /* …mirror all token colors so Tailwind utilities get them */
}

body {
  background: var(--color-krijt);
  color: var(--color-inkt);
}
```

Tailwind 4 reads `@theme` from CSS, so the bridge between our tokens and Tailwind utilities is one block of CSS rather than a JS config. If Tailwind 4 turns out to misbehave on something specific, fall back to TW3's `tailwind.config.ts` importing from `@runtime/design-tokens/tokens.ts` — both paths are documented in the design-tokens README.

`app/page.tsx` is the smoke screen — one section, big header in Inkt, body text in Houtskool, an amber dot inline. No layout ambition. Proves the tokens loaded.

### 4. ESLint + Prettier at the root

Single `.prettierrc` at root (semicolons: false, single quotes, trailing commas all, 100-char width — match the prose register: spare, calm, no semi-colon vertical noise). Single `eslint.config.mjs` at root using the new flat-config format, with Next's plugin scoped to `apps/web/**`.

Add `.editorconfig` while we're here — two-space indent, LF line endings, trim trailing whitespace.

### 5. Supabase skeleton

```
supabase/
├── migrations/        (empty directory with a .gitkeep)
├── seed.sql           (empty file)
└── config.toml        (default from `supabase init`, region eu-central-1)
```

`apps/web/.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

No actual Supabase client wiring this pitch. The skeleton exists so the next pitch that touches the DB has somewhere to put a migration.

**Manual step for Luk** (documented in the README, not done by Claude): create the Supabase project at supabase.com, EU region, copy the URL and anon key into `apps/web/.env.local`. This is a five-minute web-UI step before the first deploy.

## Out of scope

- **Turborepo.** Per [[../../architecture/001-stack-decisions#Monorepo structure]] — npm workspaces alone is enough until cross-package builds get slow. Adopt the day a `web` build is repeating work a `packages/design-tokens` build already did. Not before.
- **GitHub Actions CI.** Separate pitch in [[02-website-foundation]] (`GitHub Actions CI` slot). This pitch creates `.github/` only if needed for a single `CODEOWNERS` or similar; otherwise leaves it empty.
- **Domain + DNS + email auth.** Separate pitch. This evening is local scaffold only.
- **Vercel hookup.** No deploys this evening. `vercel.json` doesn't ship. Connecting the GitHub repo to Vercel is a five-minute manual step Luk does when the first deploy is desired.
- **Railway hookup for FastAPI.** No `apps/api/` yet — Block 6's job.
- **Xcode project.** No `apps/ios/` yet — Block 5's job. Don't create an empty `apps/ios/` directory; let Block 5 own that initial commit.
- **`packages/email/` and `packages/api-types/`.** Those are real packages with non-trivial setup (React Email, OpenAPI codegen). They land when their respective blocks need them. This pitch doesn't create empty placeholders for them — empty packages confuse `npm install` and serve no one.
- **Database migration tooling beyond `supabase/migrations/`.** Run `supabase db push` from the CLI when migrations exist. No custom migration framework.
- **CMS.** No. The website content is in-repo TSX/MDX.
- **Husky / lint-staged / pre-commit hooks.** Adopt when there's something for them to enforce — currently the local-gates skill handles it.

## Risks / unknowns

- **Tailwind 4 is recent.** Released early 2025, has the CSS-first `@theme` approach. Documentation and ecosystem are still catching up; some Tailwind 3 plugins haven't migrated. Mitigation: scope the v4 commitment to *just* the `@theme` block that maps our tokens. If we need a plugin that's 3-only, the escape hatch is `tailwind.config.ts` from `@runtime/design-tokens/tokens.ts` (a one-line change). Don't promise more than the bridge.
- **`apps/web/` consuming a workspace package via `@runtime/design-tokens` requires `npm install` to symlink correctly.** This is npm workspaces' bread-and-butter; should just work. Mitigation: smoke the install + dev flow locally before declaring shipped. If npm misbehaves, pnpm or bun are escape hatches but breaking the "[[../../architecture/001-stack-decisions]] picks npm workspaces" decision is a separate conversation.
- **Next.js 15 + React 19 may surface edge-case dependency warnings.** All major libraries support React 19 by now (mid-2026); residual peer-warnings on installs are normal and not blocking. Mitigation: only flag if something actually fails at build.
- **No `package.json` previously existed, so the `packages/design-tokens/` files are about to be touched by `npm install` for the first time.** The generated `dist/` files should not regenerate during install. Mitigation: keep the generator separate from the install lifecycle — no `prepare` or `postinstall` script. The README's contract (*run the generator after edits*) stays the only way `dist/` changes.
- **Hand-crafted Next.js scaffold vs `create-next-app`.** `create-next-app` is the path of least resistance but produces ~15 files of opinions (Inter via `next/font/google`, app icon, Vercel analytics nudge, etc.) that we'd then need to either accept silently or undo individually. Hand-crafting six files is faster than auditing the generator's output for things we don't want. Risk: missing a piece of Next.js convention. Mitigation: keep the file list small and well-known; if something breaks, the gap is obvious.
- **Tailwind v4's `@theme` re-declaring CSS variables that already exist on `:root` from `tokens.css` is a small redundancy.** Tailwind 4 reads `@theme` to know which utility classes to generate, but the variables it defines are the same ones we already imported. Mitigation: either drop the `--color-*` re-declaration in `@theme` and use Tailwind's `--color-*` directly (cleaner), or keep both (more explicit). Pick one in implementation, document in the design-tokens README. Probably keep `@theme` as a *naming* declaration and let CSS vars resolve through.
- **First `package-lock.json` is about to be committed.** Massive file. Normal. Single first-install diff; routine after.

## Related

- Block: [[blocks/02-website-foundation]] — this is the *Monorepo + Next.js + Supabase scaffold* slot, pulled forward one block.
- Architecture: [[../../architecture/001-stack-decisions#Monorepo structure]], [[../../architecture/001-stack-decisions#Next.js (not Nuxt)]], [[../../architecture/001-stack-decisions#Supabase as the database (Postgres + Auth + Storage)]].
- Just-shipped sibling: [[shipped/design-tokens-single-source-of-truth]] — this pitch's main consumer, finally turning into a real workspace package.
- Unblocks: [[font-integration]] (needs `apps/web/app/layout.tsx`), [[wordmark-as-component]] (needs `apps/web/app/_components/`), every Block 2/3/4 pitch downstream.

---

## What actually happened

Workspace root, `apps/web/` running Next.js 15 + App Router + React 19 + TypeScript + Tailwind 4, `packages/design-tokens/` finally wrapped as `@runtime/design-tokens` and consumed via `@import '@runtime/design-tokens/tokens.css'` from `apps/web/app/globals.css`. 

Two surprises that ate ten minutes each:

1. **Next.js's `next lint` was deprecated in 15.5** with a notice that it'll vanish in 16. Migrated `apps/web` to call `eslint .` directly using a `FlatCompat` shim around `eslint-config-next` — clean now, no deprecation noise. Same plugin, different invocation.
2. **Prettier walked into everything.** First `format:check` run reported 30 files because the script had `--ignore-path .gitignore` and `.gitignore` only ignores generated output, not prose. Added `.prettierignore` covering `docs/`, `packages/design-tokens/dist/` (generated, untouchable), `README.md` (paragraph wrapping is intentional), and dropped the `--ignore-path` override so Prettier auto-picks `.prettierignore`. 

What to watch:

- **Tailwind 4 is recent enough** that ecosystem plugins may not be ready when we need them. Escape hatch documented in the pitch — fall back to TW3 with a JS config consuming `tokens.ts`. Don't need it today.
- **Node 25.2.1 is what's installed locally**, while `.nvmrc` says `20` and `engines.node` says `>=20.11`. 25 is fine for dev; the version pin matters when CI lands (Block 2's *GitHub Actions CI* pitch) — set CI to whatever the LTS is at that time.
- **No git commits yet, no `.cz.toml`.** Commitizen setup is its own piece of work before the first ship that actually needs a version bump. Both the tokens pitch and this scaffold pitch have shipped pre-version; the third ship at the latest should establish the convention.

No deviations from the sketch. Release step skipped per agreement.
