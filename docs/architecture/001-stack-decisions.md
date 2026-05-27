---
project: runtime
type: architecture-decisions
status: locked
updated: 2026-05-26
---
# Stack Decisions

The architecture choices made before any line of code was written. Each one captured here with the reasoning, so future-Luk doesn't have to reverse-engineer it from the block notes and so Claude Code has a single page to read on day one.

These decisions are **locked for the pilot launch**. Revisit at the post-pilot retrospective, not before.

## The shape

```
                          ┌──────────────────────────┐
                          │   Supabase (Postgres +   │
                          │   Auth + Storage)        │
                          └──────────────┬───────────┘
                                         │
                          ┌──────────────┴───────────┐
                          │   FastAPI (Python)        │
                          │   The only API surface    │
                          │   Hosted on Railway       │
                          └──┬───────┬───────────┬───┘
                             │       │           │
                  ┌──────────┘       │           └───────────┐
                  │                  │                       │
        ┌─────────▼────────┐  ┌──────▼──────┐      ┌─────────▼────────┐
        │  Next.js public  │  │  Next.js    │      │   iOS app        │
        │  site            │  │  /coach     │      │  (SwiftUI)       │
        │  (calendar +     │  │  /organizers│      │  (device token   │
        │   marketing +    │  │  (Supabase  │      │   auth)          │
        │   waitlist +     │  │  Auth)      │      │                  │
        │   pilot intake)  │  │             │      │                  │
        └──────────────────┘  └─────────────┘      └──────────────────┘
                  │
            Vercel deployment
```

Email through **Resend**. Analytics through **Plausible**.

## Decision log

### Next.js (not Nuxt)

**Decided.** Familiarity with Vue would have favoured Nuxt 3, but Claude Code's training distribution skews heavier toward Next.js + React, and Claude is a major contributor on this project. Next.js + TypeScript + Tailwind. App Router. SSG for the calendar pages (SEO-critical), ISR for race detail pages so updates propagate without rebuilds. Hosted on Vercel.

### Supabase as the database (Postgres + Auth + Storage)

**Decided.** Managed Postgres with great DX, baked-in auth, baked-in object storage. EU region for data residency. Free tier covers the pilot easily. Same database serves the website, the iOS app, the coach console, and the organizer portal — single source of truth.

Auth is used for **two roles only**: `admin` (Luk + An, access to `/coach`) and `organizer` (race submitters, access to `/organizers`). End-user runners do **not** have Supabase accounts — see *iOS auth* below.

### FastAPI (Python) as the only API surface

**Decided.** Everything that reads or writes the database goes through FastAPI. The Next.js frontend calls FastAPI. The iOS app calls FastAPI. The coach console calls FastAPI. No client talks to Supabase directly — that decoupling means the DB schema can evolve without breaking three clients.

Python because Luk's faster in it than Node. FastAPI because async, typed, auto-OpenAPI, fits a tiny team.

### Railway for FastAPI hosting

**Decided.** Long-lived FastAPI process, not serverless. Cold starts on Python serverless (Vercel functions, Lambda) hurt the iOS app's "open the app at 6am, see today's workout immediately" UX. Railway keeps the process warm, costs $5–10/month at pilot scale, and has a Vercel-like DX (one-command deploys, env vars UI, GitHub integration).

If we outgrow Railway, Fly.io is the next step. Same patterns, more knobs.

### iOS auth: per-device tokens, not Supabase Auth

**Decided.** When a runner is accepted into the pilot, Luk emails them a single-use claim code (random 8-char string). On first app launch they enter the code, the app exchanges it for a long-lived device token, that token authenticates every subsequent app→API call. No password, no email confirmation in the app, no Supabase Auth dependency.

Why: the runner already identified themselves in the pilot intake form on the website. A second account creation flow inside the app is friction without value. Plus the iOS surface stays clean of password reset UI, email confirmation screens, OAuth provider buttons — none of which serve the pilot.

When end-user accounts eventually matter (v2, when there are non-pilot runners signing up directly), this gets revisited.

### Resend for email

**Decided.** Transactional + small-volume marketing. React Email templates that live in the Next.js codebase, version-controlled alongside the rest of the brand voice. 3k emails/month free covers the pilot. EU region for GDPR.

Templates needed at launch:
1. Pilot intake confirmation (immediate on form submit)
2. Pilot welcome (on acceptance)
3. Pilot decline / waitlist (on rejection)
4. Waitlist welcome (on general waitlist signup)
5. Organizer signup confirmation
6. Organizer submission acknowledged
7. Organizer race approved / changes requested

Domain authentication (SPF/DKIM/DMARC) configured before first send. Plan an hour for this.

### Plausible for analytics

**Decided.** EU-hosted, GDPR-clean, no cookies. €9/month. The brand voice is anti-surveillance ([[../product-design/002-design-brief]]) — Google Analytics on the site would contradict everything else we say.

Self-hosted Umami was considered. Rejected: not worth saving €108/year against the maintenance cost of an analytics service that breaks on Sunday morning.

### Storage: Supabase Storage

**Decided.** Race images (if any), organizer logos, future app screenshots. Lives next to the DB. Same backups, same region, same access controls. Avoid S3 for now.

### Sentry for error monitoring

**Recommended, not yet decided.** Free tier covers low-traffic apps comfortably. Both Next.js and FastAPI have first-class integrations. Catches the "this errored in production at 6am for one runner" cases that otherwise vanish into logs. Set up alongside the first deploy.

## What's NOT in the stack

Deliberately excluded:
- **Kubernetes, Terraform, container orchestration.** No.
- **A separate microservice per domain.** No — one FastAPI app handles every endpoint until it doesn't, and that won't be in year one.
- **Redis, Memcached.** No caching layer until measurements demand it.
- **GraphQL.** REST + OpenAPI is fine at this scale.
- **A CDN beyond what Vercel and Supabase already provide.** No.
- **Sign-in-with-Apple, OAuth providers, social login.** No — none of the launch flows need it.
- **Multi-tenant infrastructure.** No — single-tenant, single-region, single-deployment.

All of these are real engineering decisions that *would* matter at scale, none of which need to ship in the first two months. Bake them in only when measurements show they're needed.

## Cost estimate at launch (sub-1k users)

| Service | Plan | Monthly |
|---|---|---|
| Vercel | Hobby (free) | €0 |
| Supabase | Free | €0 |
| Railway | Starter | ~€5 |
| Resend | Free (3k/mo) | €0 |
| Plausible | Personal | €9 |
| Domain (`runtime.training`) | annual | ~€2/mo amortized |
| Apple Developer Account | annual | ~€8/mo amortized |
| **Total** | | **~€24/month** |

At pilot scale this is well under the cost of a single Strava Premium subscription. Real costs start when we cross 10k users, which is a year+ out.

## Monorepo structure

Single GitHub monorepo at `github.com/runtime-training/runtime` (or wherever Luk owns the org). Tree:

```
runtime/
├── apps/
│   ├── web/              Next.js — public site + /coach + /organizers
│   ├── api/              FastAPI
│   └── ios/              Xcode project (SwiftUI)
├── packages/
│   ├── design-tokens/    Shared tokens (TS for web, JSON exported for iOS)
│   ├── email/            React Email templates
│   └── api-types/        OpenAPI-generated TS types for web → FastAPI
├── supabase/
│   ├── migrations/       SQL migrations
│   └── seed.sql          Seed data for local dev
├── .github/
│   └── workflows/        GitHub Actions (see CI/CD below)
├── package.json          npm workspaces root
└── README.md
```

**Workspace tooling: npm workspaces, not Turborepo.** Plain npm workspaces is enough until cross-package builds get slow enough to cache. Likely ~3 months out. **Postponing Turborepo** — adopt it the day a `web` build is repeating work a `packages/design-tokens` build already did. Not before.

**iOS lives in the repo but not in the workspace graph.** Xcode is happiest in its own directory with its own build system. `apps/ios/` reads `packages/design-tokens/tokens.json` at build time via a script-build-phase, but doesn't participate in `npm install`.

**Supabase migrations live at the repo root**, not inside `apps/api/`. The database is shared across web and FastAPI, so the migration history is repo-level, not service-level. Run with `supabase db push` (production) or `supabase db reset` (local).

One repo because the team is one + Claude. Cross-cutting changes (schema → API → frontend → email template) happen in single PRs. Will split when there's a real reason.

## CI/CD

GitHub Actions on `push` to `main` and on every PR. Path-filtered jobs so changes to one app don't trigger the others' CI — critical for evening-work velocity.

### `ci.yml` — three parallel jobs, path-filtered

```yaml
on: [pull_request, push: { branches: [main] }]
```

- **`web-ci`** — runs when `apps/web/**` or `packages/**` changed. Type-check, lint, build, Playwright smoke tests against the Vercel preview URL.
- **`api-ci`** — runs when `apps/api/**` changed. Ruff (lint), mypy (typecheck), pytest, Docker build (to verify it builds, not to push).
- **`ios-ci`** — runs when `apps/ios/**` changed. SwiftLint, build the project. No UI tests in CI (flaky and slow — run locally before TestFlight uploads).

Each job is independent. PR on `web/` only doesn't trigger iOS builds.

### Web deploys: Vercel watches GitHub directly

Not a GitHub Action. Vercel's native GitHub integration builds previews on PR (with a URL posted to the PR), promotes to production on merge to `main`. Zero config beyond the initial Vercel project setup.

### API deploys: Railway watches GitHub directly

Same pattern as Vercel. Railway's native GitHub integration builds and deploys on push to `main` when `apps/api/**` changes. No GitHub Action needed.

### `migrations.yml` — manual trigger only

```yaml
on: { workflow_dispatch }
```

Applies Supabase migrations via the Supabase CLI against the production project. **Never automatic.** Migrations are destructive enough that a human always clicks the button. Local dev runs `supabase db reset` instead.

### Explicitly postponed

- **Preview environments for FastAPI.** Railway can spin a preview deploy per PR; we're not doing that. The 90%+ of PRs that touch only `apps/web/` use the Vercel preview against production FastAPI. The rare `apps/api/` PR gets manually tested against a local FastAPI before merging. **Revisit if `apps/api/` PR volume crosses ~5/week, or if a regression slips to prod that a preview environment would have caught.** Cost saved: ~$5/month + the setup time.

- **iOS code signing in CI.** Apple cert + Match + GitHub Actions secrets = roughly half a day of setup pain. We're skipping it. TestFlight uploads happen from Luk's Mac with Xcode's GUI. **Revisit when TestFlight uploads cross ~2/week, when a second developer joins, or when a release goes out while Luk is away from his Mac.** Until any of those, manual upload from the Mac is faster than the CI setup it would replace.

- **Performance and visual regression testing.** No Lighthouse CI, no Percy/Chromatic. The web app is small enough that human review at PR time catches what automation would. Revisit when the site has 10+ page templates and design changes start causing surprise regressions.

- **Multiple deployment environments (staging/prod).** One environment per service. Branches that aren't `main` use Vercel previews (web) or local dev (everything else). A real staging environment earns its keep only when there are users in prod whose breakage matters more than the friction of an extra promotion step. Not yet.
