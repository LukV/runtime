---
project: runtime
type: planning-block
block: website-foundation
status: in-progress
updated: 2026-05-31
---
# Block 2 — Website Foundation

The shared furniture of `runtime.training` — the technical foundation that the calendar, the intake, the coach console, the organizer portal, and (eventually) the race-day briefing all sit on. Stack locked in [[../../architecture/001-stack-decisions]]. Domain, hosting, framework, deployment, the nav, the footer, the brand system applied to a real site.

This block is **not** the calendar page or the intake page — it's the substrate they both ride on. Done well, adding a new page later is a couple of evenings; done badly, every page reinvents nav, footer, type styles, and SEO metadata.

Design: [[../../product-design/004-design-system-and-screens#4. The website]].

**Status: 7 of 8 slots shipped.** Monorepo scaffold pulled forward in block 1 (2026-05-27, v0.1.0); Vercel project setup + domain/DNS/mail-auth shipped together on 2026-05-31; CI shipped 2026-05-31; Nav + footer shipped 2026-05-31; Page chrome (SEO + metadata) shipped 2026-06-01; Hoe het werkt + Over ons + Meebouwen + Privacy shipped 2026-06-01. Plausible integration is next.

## Pitches

### Monorepo + Next.js + Supabase scaffold — *an evening* — [[../pitches/shipped/monorepo-nextjs-supabase-scaffold|shipped 2026-05-27]]

Single GitHub monorepo, exact structure per [[../../architecture/001-stack-decisions#Monorepo structure]]:

```
runtime/
├── apps/{web,api,ios}/
├── packages/{design-tokens,email,api-types}/
├── supabase/{migrations,seed.sql}/
├── .github/workflows/
├── package.json (npm workspaces)
└── README.md
```

This pitch creates the skeleton: workspaces root, `apps/web/` (Next.js 15+, App Router, TypeScript, Tailwind), empty placeholders for `apps/api/` (filled in by [[06-coach-backend-woz]]) and `apps/ios/` (filled in by [[05-ios-app-downsized]]). Supabase project created in EU region, env vars wired. Tailwind config imports design tokens from `packages/design-tokens/` ([[01-brand-system-in-code]]).

ESLint + Prettier configured at the workspace root, shared across packages. README documents the workspace layout + how to run each app locally.

*Out of scope.*
- Turborepo (postponed per [[../../architecture/001-stack-decisions#Monorepo structure]] — npm workspaces alone until cross-package builds get slow).
- Database migration tooling beyond the Supabase CLI.
- CMS.

### Vercel project setup — *an evening* — [[../pitches/shipped/vercel-project-setup|shipped 2026-05-31]]

Pulled out of the originally-folded `Domain + DNS + email auth` slot to land first — Vercel previews unlock CI's Playwright smoke and become the deploy target for the domain pitch. Live at `https://www.runtime.training`, serving from `cdg1` (Paris).

### GitHub Actions CI — *an evening* — [[../pitches/shipped/github-actions-ci|shipped 2026-05-31]]

Per [[../../architecture/001-stack-decisions#CI/CD]]. Three workflows in `.github/workflows/`:

**`ci.yml`** — path-filtered, three parallel jobs:
- `web-ci` (runs when `apps/web/**` or `packages/**` changed): type-check, lint, build, Playwright smoke against the Vercel preview URL.
- `api-ci` (runs when `apps/api/**` changed): ruff, mypy, pytest, Docker build verification.
- `ios-ci` (runs when `apps/ios/**` changed): SwiftLint, build the project. No UI tests in CI.

**`migrations.yml`** — `workflow_dispatch` only. Runs `supabase db push` against production. Human always clicks.

Web + API deploys handled by Vercel and Railway's native GitHub integrations — not GitHub Actions.

*Explicitly postponed.* Per [[../../architecture/001-stack-decisions#CI/CD]]: no FastAPI preview environments per PR, no iOS code-signing in CI, no Lighthouse/Percy/Chromatic, no staging environment. Each one is documented with the threshold that would make us revisit.

*Note for first run.* The `ios-ci` job stays as a placeholder until [[05-ios-app-downsized]] adds the Xcode project — until then it'll never trigger (no matching paths).

### Domain + DNS + email auth — *an evening* — **shipped 2026-05-31** (no pitch file, work done in DNS UI)

Originally framed as Vercel + DNS + SPF/DKIM/DMARC + MX in one slot. Vercel half got carved into its own pitch ([[../pitches/shipped/vercel-project-setup]]); the rest shipped without a pitch file because Luk did it directly in the registrar and Google Workspace admin in one sitting.

What landed: `runtime.training` registered, apex 307s to `www`, DNS A + CNAME → Vercel, MX → `smtp.google.com`, Google Workspace alias `luk@runtime.training`, SPF (`v=spf1 include:_spf.google.com ~all`), DMARC at `p=none` with `rua=mailto:dmarc@runtime.training`, DKIM at `google._domainkey` (1024-bit RSA).

Future follow-ups (each ~15 min, no pitch needed): regenerate DKIM at 2048-bit; ratchet DMARC from `p=none` → `p=quarantine` → `p=reject` after watching reports; confirm `dmarc@runtime.training` actually receives mail. Resend (transactional email from the app) is deferred until block 4 needs intake confirmations.

### Nav + footer as shared components — *an evening* — [[../pitches/shipped/nav-footer-shared-components|shipped 2026-05-31]]

Top nav: Source Serif wordmark left, *Kalender · Hoe het werkt · Over ons · Krijg de app* right. Sticky on scroll, semi-transparent ink background past the hero. Footer: wordmark + brand line *Het werk is het feest*, secondary links, copyright. Both live as `<SiteHeader />` and `<SiteFooter />` in the components folder, used across every page.

*Open question.* The "Krijg de app" CTA in early weeks — before the app is in the App Store, what does this button do? Default: link to the pilot landing until launch is closer. Revisit when TestFlight builds exist.

### Page chrome: SEO defaults + metadata helper — *an evening* — [[../pitches/shipped/page-chrome-seo-metadata|shipped 2026-06-01]]

Next.js metadata API with sensible defaults for every page: title template (`{page title} · runtime.training`), description, OpenGraph image (a square ink card with the wordmark), Twitter card. Per-page overrides are one prop away.

Schema.org markup helpers for:
- The whole site (`Organization`)
- Race pages (`SportsEvent`, when we get to them)
- Article pages (the *Hoe het werkt* / *Over ons* explainers)

*Why this matters.* Calendar SEO is the whole traffic thesis. Bad metadata = bad rankings = the calendar work doesn't earn its return.

### Hoe het werkt + Over ons + Privacy — *a weekend* — [[../pitches/shipped/hoe-het-werkt-over-ons-privacy|shipped 2026-06-01]]

Three static pages.

*Hoe het werkt* explains the three-step product loop (kies een doel → krijg een plan → het past zich aan) in long form with the same illustrations and design language from [[../../product-design/004-design-system-and-screens|the design system]].

*Over ons* is Luk + An, the story, the why. Personal, photo-led, no corporate copy.

*Privacy* documents what's tracked (Plausible), what's stored (Supabase EU), how runners' data is used, who can see what. Plain Dutch, no legalese template. Required for the brand voice as much as for GDPR.

*Out of scope.* Blog, press kit, jobs, careers. Those come never (or much later).

### Plausible integration — *an evening*

Per [[../../architecture/001-stack-decisions#Plausible for analytics]]. Add the Plausible script (or proxy through Next.js to avoid ad-blockers). Track:
- Page views (default)
- Pilot intake CTA clicks
- "Krijg de app" CTA clicks
- Outbound clicks to organizer registration URLs from race pages
- Waitlist form submissions
- Pilot intake form submissions

No custom dimensions. No funnels beyond what Plausible offers out of the box. Privacy page documents what's tracked.

### Sentry — *an evening*

Per [[../../architecture/001-stack-decisions#Sentry for error monitoring]]. Sentry SDK in both Next.js and FastAPI. Free tier. Source maps uploaded on deploy. Alerts to Luk's email on first occurrence of a new error in prod.

*Out of scope.* Performance monitoring, session replay, user feedback widgets. Errors only.

## Open design items

- **The "Krijg de app" CTA in early weeks.** Default to (b) link to pilot landing until launch is closer.
- **Email hosting choice.** Fastmail vs. Google Workspace vs. Proton. Fastmail probably right (€36/yr, EU-hosted, clean UX). Decision can wait until DNS work.

## Dependencies

- **Needs:** [[01-brand-system-in-code]] (tokens, wordmark, nav components).
- **Provides:** the foundation for [[03-race-calendar]], [[04-pilot-intake]], [[06-coach-backend-woz]] (the `/coach` admin pages live in the same Next.js project), and [[08-organizer-submissions]] (the `/organizers` portal too).
