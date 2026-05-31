---
project: runtime
type: pitch
status: draft
area: website
block: website-foundation
appetite: an evening
created: 2026-05-30
---
# GitHub Actions CI

## Problem

Block 1's web app builds clean on Luk's machine, but the only thing standing between a typo in `apps/web/app/page.tsx` and a broken `main` is Luk remembering to run `npm --workspace apps/web run build` before pushing. That works for solo evening work where every push is hand-driven; it falls over the moment a PR comes in from anywhere else, or the moment Luk wants to merge from his phone, or the moment something subtle (a missing dep, a TS regression in a type re-export, a lint rule that's a warning locally but an error in CI's stricter Node version) slips through.

The brand-system pitches all proved the local gates work — `lint`, `typecheck`, `next build`, all green by the time we hit ship. CI's job is to make those exact gates **non-optional** on the path to `main`. Cheap, mostly invisible, catches the dumb stuff.

The shape is settled in [[../../architecture/001-stack-decisions#CI/CD]] — path-filtered jobs per app, GitHub Actions, no preview environments for FastAPI, no iOS code signing, no Lighthouse. This pitch is the implementation of that decision, sized to fit what exists today (`apps/web/` only) while leaving correctly-shaped slots for `apps/api/` and `apps/ios/` to slot into when their blocks land.

**Sequencing note.** This pitch ships *after* [[vercel-project-setup]] — Vercel preview URLs need to exist before the Playwright smoke job has anything to point at.

## Appetite

**An evening.** Cap is binding. The pitch ships:

1. **`.github/workflows/ci.yml`** with three path-filtered jobs (`web-ci`, `api-ci`, `ios-ci`). `web-ci` is fully active and runs lint + typecheck + build + Playwright smoke against the Vercel preview URL. `api-ci` and `ios-ci` are wired correctly but never trigger today because `apps/api/**` and `apps/ios/**` don't match any file in the repo — they wake up automatically when their blocks land. No second CI pitch needed when block 5 or 6 starts.
2. **Triggers**: `pull_request` against `main` and `push` to `main`. No scheduled runs, no manual triggers.
3. **Node setup**: action uses `actions/setup-node@v4` reading `.nvmrc` (Node 20) with npm cache enabled.
4. **Playwright smoke**: a single test that loads the Vercel preview URL (read from the PR's deployment status), confirms the page returns 200, and asserts the wordmark text "runtime" is present in the rendered DOM. One test, one assertion, no fixtures — just enough to catch a totally-broken deploy that compiled but doesn't render.
5. **README update** noting that CI runs on every PR and what each job checks. One paragraph in the existing root README.

What's **not** in this pitch (with reasoning, so we don't re-litigate at v0.3):

- **`migrations.yml`** — the architecture decision calls for a `workflow_dispatch`-only Supabase migration runner. Supabase isn't set up (no project, no secrets, no `supabase/migrations/` directory). Belongs to a dedicated *Supabase project + migrations workflow* pitch that lands when block 6 (coach backend) or block 4 (pilot intake) creates the first migration. Writing the file now means writing a workflow that targets nothing.
- **Caching beyond `actions/setup-node`'s npm cache** — no Next.js build cache, no Vercel turbo cache. The build is currently sub-second; cache complexity isn't earning its keep yet. Revisit when CI run time crosses ~2 minutes.
- **Required status checks on `main`** — the GitHub branch protection rule that gates merges on CI green. Set this up *after* the first CI run succeeds, because GitHub won't let you require a check that's never reported a result. One-click via the GitHub UI, not in this pitch's scope.
- **Playwright tests beyond the smoke test.** Multi-page navigation, form interaction, visual regression — all deferred. The smoke test is the one assertion CI can make about the deployed site; richer E2E coverage lands when the site has more than a smoke page to test.

If the evening runs out, cuts in this order:

1. **Drop the Playwright smoke.** Ship lint + typecheck + build only. Vercel's own build status check already covers "did the deploy work", so the smoke is a belt-and-suspenders check that catches the narrow case where compile succeeds but render fails. Worth ~5 minutes; cuttable.
2. **Drop the `api-ci` and `ios-ci` placeholder jobs.** Ship `web-ci` only. Add the other two as one-line additions when their blocks land. Small loss — the placeholders are mostly documentation.
3. **Drop the README update.** The workflow file's own comments document what it does; the README pointer is nice-to-have, not load-bearing.

The non-negotiable is *a PR that breaks the build fails CI, and a PR that's clean passes CI, both within ~90 seconds*. Below that bar the pitch hasn't shipped.

## Sketch

Two pieces — the workflow file and the README pointer.

### 1. `.github/workflows/ci.yml`

Single workflow file with three jobs. Path filters via the `paths` key on the workflow's `on:` triggers don't compose cleanly with per-job conditional execution, so we use `dorny/paths-filter@v3` to detect changes once and gate each job on its filter output. Standard pattern, well-supported, no surprises.

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      web: ${{ steps.filter.outputs.web }}
      api: ${{ steps.filter.outputs.api }}
      ios: ${{ steps.filter.outputs.ios }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            web:
              - 'apps/web/**'
              - 'packages/**'
              - 'package.json'
              - 'package-lock.json'
              - '.github/workflows/ci.yml'
            api:
              - 'apps/api/**'
            ios:
              - 'apps/ios/**'

  web-ci:
    needs: changes
    if: needs.changes.outputs.web == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm --workspace apps/web run lint
      - run: npm --workspace apps/web run typecheck
      - run: npm --workspace apps/web run build

  web-smoke:
    needs: [changes, web-ci]
    if: needs.changes.outputs.web == 'true' && github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      # Waits for Vercel's preview deployment to succeed on this PR, then
      # captures the deploy URL into $PREVIEW_URL. patrickedqvist/wait-for-vercel
      # is a small action; if it goes unmaintained, swap for a ~10-line gh API
      # poll. The smoke runs only on PRs (push to main has no preview URL).
      - id: vercel
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 180
      - run: npx playwright install --with-deps chromium
      - run: npm --workspace apps/web exec -- playwright test smoke
        env:
          PREVIEW_URL: ${{ steps.vercel.outputs.url }}

  api-ci:
    needs: changes
    if: needs.changes.outputs.api == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Placeholder — wakes up when apps/api/ lands (block 6).
      # Will run: uv sync, ruff check, ruff format --check, mypy, pytest.
      - run: echo "apps/api/ not yet created; this job is a stub until block 6"

  ios-ci:
    needs: changes
    if: needs.changes.outputs.ios == 'true'
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      # Placeholder — wakes up when apps/ios/ lands (block 5).
      # Will run: swiftlint, xcodebuild for the project.
      - run: echo "apps/ios/ not yet created; this job is a stub until block 5"
```

Why the `changes` job rather than top-level `paths:` filters: top-level `paths:` skips the *whole workflow*, which means the PR shows no checks at all — and "no check reported" looks identical to "check pending" in the GitHub PR UI. Detecting changes inside the workflow lets every PR record three checks (some as "skipped"), so reviewers can see the system is alive.

**On `web-smoke` as a separate job (not a step in `web-ci`).** Splitting them means `web-ci`'s fast feedback (lint+typecheck+build, ~60s) doesn't wait on the slower preview-deploy step (~120s). A PR that fails lint shows that within a minute; the smoke runs in parallel for the cases where the build passes. Also: the smoke job is gated on `github.event_name == 'pull_request'` because pushes to `main` happen *after* a merge — there's no PR-scoped preview deploy to test against. Production deploys verify themselves via Vercel's own checks.

**On `playwright install --with-deps`.** Installs Chromium plus the system libraries it needs in the Ubuntu runner. Cold install adds ~30 seconds; cacheable with `actions/cache@v4` on `~/.cache/ms-playwright` if it becomes a bottleneck. Not pre-empted.

### Playwright test file

A single smoke test lives at `apps/web/tests/smoke.spec.ts`. Reads `PREVIEW_URL` from env, asserts the page renders and contains the wordmark:

```typescript
import { test, expect } from '@playwright/test'

const PREVIEW_URL = process.env.PREVIEW_URL
if (!PREVIEW_URL) throw new Error('PREVIEW_URL env required')

test('smoke: site loads and wordmark renders', async ({ page }) => {
  const response = await page.goto(PREVIEW_URL)
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('img', { name: 'runtime' }).first()).toBeVisible()
})
```

Playwright config (`apps/web/playwright.config.ts`) is minimal — one project (chromium), no baseURL (the smoke reads it from env), no screenshots/videos by default. The `@playwright/test` dep gets added to `apps/web/package.json` as a devDep.

### 2. README pointer

Add a short paragraph to the existing root `README.md` under a `## Quality gates` or `## CI` section:

> CI runs via GitHub Actions on every PR to `main` and every push to `main`. Path-filtered: a PR touching only `apps/web/**` runs the web checks (lint, typecheck, build) and skips the iOS/api jobs entirely. The full set of local gates is documented in `.claude/skills/local-gates/SKILL.md` for parity.

That's it. The branch protection rule (require `web-ci` to pass before merge) is a one-click setup in the GitHub UI after the first run reports a result — not in this pitch.

## Out of scope

- **Playwright tests beyond the smoke check.** Form interaction, multi-page navigation, auth flows, visual regression — all deferred. The smoke test asserts "the deploy renders and the wordmark is in the DOM"; richer coverage lands when there's something richer to cover.
- **`migrations.yml`.** Belongs to a "Supabase setup + migrations workflow" pitch that lands when the first real migration exists. Writing it now means writing a guarded no-op that fails on first manual trigger because the secrets don't exist.
- **Required status checks / branch protection.** One-click GitHub UI setup after CI's first successful run. Notable enough to flag in the ship reflection so Luk remembers to do it.
- **Caching beyond `setup-node`'s built-in npm cache.** Build time isn't a constraint yet. Revisit at ~2 minutes per run.
- **Self-hosted runners / runner sizing.** Default `ubuntu-latest` / `macos-latest` are fine until they're not. No reason to think they won't be.
- **Notifications on CI failure (Slack, email, etc).** GitHub's default email-on-CI-failure to the PR author is enough for a solo developer. Revisit when a second developer joins.
- **Sentry source-map upload from CI.** Sentry pitch is later in the block. Source-map upload is a step *in that pitch's workflow integration*, not a separate CI concern.
- **Auto-merge on green.** Tempting (small repo, single committer), but a near-zero-cost human review pass on every PR catches things CI won't. Stay manual.
- **Per-PR Vercel preview triggering from CI.** Vercel watches GitHub directly per the architecture decision — it doesn't need CI to invoke it. The two systems run in parallel on every PR.
- **Tests.** No test framework wired in `apps/web/` yet. When it lands (vitest probably), add `npm test --if-present` to the web-ci job. One-line follow-up.

## Risks / unknowns

- **First-time GitHub Actions cost.** Public repos get unlimited free minutes. `LukV/runtime` is currently private (per the repo URL given). Private repos get 2,000 free Actions minutes/month on the free plan. At ~60s per CI run × ~20 PRs/month = ~20 minutes. Comfortable margin. Worth checking the repo's visibility before shipping; the cost calculus changes at scale but not at evening-work scale.

- **`dorny/paths-filter` is a third-party action**, not maintained by GitHub. It's the most widely-used paths-filter action (~5k stars, used by major OSS projects) and the alternatives are write-it-yourself shell scripts. The dependency is small, the action is pinned to `@v3` (no auto-update to `v4`), and the swap to a hand-rolled version is ~15 lines of bash if the action ever goes unmaintained. Acceptable.

- **`actions/checkout@v4` fetch depth is 1 by default**, which means commit history isn't available in the runner. Doesn't matter for this pitch (no commit-history-dependent steps), but worth knowing: if a future job needs `git log` (e.g., for changelog generation), set `fetch-depth: 0` on that job's checkout.

- **`npm ci` requires a `package-lock.json` that matches `package.json` exactly.** It does today (we've been disciplined about committing the lockfile). If `npm install` is run locally and the lock drifts, CI will fail with a clear "lockfile out of sync" error. Mitigation: never use `npm install` to update a dep without committing the resulting lockfile.

- **The `web-ci` job builds the Next.js app from scratch on every run**, which includes downloading the Inter Variable font, the Tailwind binary, etc. First run will be ~60s; subsequent runs benefit from the `setup-node` cache. If first-run cost becomes annoying, the answer is `actions/cache@v4` on `.next/cache`. Don't pre-empt that.

- **`patrickedqvist/wait-for-vercel-preview@v1.3.2`** is the only third-party Vercel-aware action in the pitch. It polls GitHub's deployment API for the Vercel deployment matching the PR head SHA and returns the deploy URL. Stable, used by many OSS projects, swap is a ~10-line `gh api` poll if it ever goes unmaintained. The `max_timeout: 180` waits up to 3 minutes for Vercel — generous; typical Vercel preview deploy is under 90s.

- **Smoke test flake potential.** If Vercel is rate-limiting, having a slow CDN moment, or mid-incident, the wait action times out and the smoke fails. The smoke is the *most likely* flake source in the pipeline. Mitigation: the smoke is in a separate job, so a flake doesn't block the lint+typecheck+build verdict. Re-run from the PR UI if it flakes. If flake rate crosses ~10%, add a single retry to the smoke job before considering structural changes.

- **Setting up the branch protection rule is a manual step after the first CI run.** Easy to forget. The ship reflection should mention it explicitly so it doesn't drift.

- **macOS runners are billed at 10× the rate of Ubuntu runners** on private repos. The `ios-ci` placeholder uses `macos-latest`. While the placeholder never triggers, the minute the iOS app lands, every PR touching `apps/ios/**` consumes 10× minutes. That's fine at the projected rate (a handful of iOS PRs per month at most), but worth flagging — if the iOS block generates lots of small PRs, consider running SwiftLint on Ubuntu (it has Swift toolchain support now) and only using macOS for `xcodebuild`.

- **`packages/**` triggers `web-ci`** because the web app depends on the design-tokens package. That's correct — changes to tokens.json should re-run the web build to catch token-name regressions. But it also means a doc-only change inside `packages/design-tokens/README.md` runs web-ci. Acceptable — the over-trigger is on the right side of cautious; the cost is one extra 60-second build on a docs-only PR.

## Related

- Block: [[blocks/02-website-foundation]]
- Architecture: [[../../architecture/001-stack-decisions#CI/CD]]
- Pattern precedent: [[shipped/monorepo-nextjs-supabase-scaffold]] established the workspace shape this pitch's CI mirrors.
- Local-gate parity: [[../../../.claude/skills/local-gates/SKILL.md]] — CI should run the same gates the local skill runs, in the same order.
- Sequencing prerequisite: [[vercel-project-setup]] must ship first (preview URLs).
- Deferred follow-ups (no pitch files yet):
  - *Supabase project + migrations workflow* — separate pitch when the first migration exists.
  - *Richer Playwright coverage* — when there's more than one page to test.

---

## What actually happened

*(Fill in when the pitch ships or is dropped.)*
