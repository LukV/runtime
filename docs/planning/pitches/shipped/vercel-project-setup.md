---
project: runtime
type: pitch
status: shipped
area: website
block: website-foundation
appetite: an evening
created: 2026-05-30
shipped_on: 2026-05-31
---
# Vercel project setup

## Problem

Every block-2 pitch downstream of this one assumes a deployed web app:

- [[github-actions-ci]]'s Playwright smoke wants a preview URL to test against.
- [[domain-dns-email-auth]] points `runtime.training` at *something* — that something is Vercel.
- The nav/footer/SEO pitches all want to verify their output against a real deployed page, not just `localhost:3000`.

Right now `apps/web/` builds locally and that's it. The fastest, cheapest unlock is a Vercel project connected to `LukV/runtime` — preview URL per PR, production deploy on every merge to `main`, build failures visible in the PR UI. No DNS, no domain, no email. Just the wiring.

This is the smallest possible "the site is live somewhere" pitch — pulled out of the originally-pitched [[domain-dns-email-auth]] scope because DNS propagation is slow (Saturday-morning work) and Vercel project creation is fast (one evening, mostly clicks in the Vercel UI).

## Appetite

**An evening.** Honestly closer to 30 minutes — the cap is generous on purpose because there's always one Vercel UI thing that takes an unexpected 20 minutes (auth, workspace selection, billing confirmation, build-config detection). The pitch ships:

1. **Vercel project created** at `vercel.com/<account>/runtime` (or whatever Vercel calls it), connected to the `LukV/runtime` GitHub repo.
2. **Root directory set to `apps/web/`** so Vercel builds the Next.js app, not the monorepo root.
3. **Node version pinned to match `.nvmrc`** (Node 20). Vercel reads `.nvmrc` automatically; verify it works.
4. **First production deploy succeeds** on the auto-generated `*.vercel.app` URL.
5. **First preview deploy succeeds** by opening a test PR (a one-line README edit) and watching Vercel post the preview URL as a PR check.
6. **`vercel.json` at the repo root** if any monorepo config is needed beyond what auto-detection handles. Probably empty or absent — Vercel's npm-workspaces support is solid — but the file lands if a tweak proves necessary.
7. **README addendum** documenting the deploy story: production = `*.vercel.app` URL until DNS lands, previews on every PR, no manual deploy commands.

What's deliberately **not** in this pitch:

- **DNS / domain.** Stays in [[domain-dns-email-auth]] (Saturday).
- **Email / Resend / SPF/DKIM.** Same pitch (Saturday).
- **Production environment variables.** None needed yet — `apps/web/` has no env-dependent code (no Supabase calls, no Resend calls, no Sentry). When the first env var is needed, add it to Vercel then; this pitch doesn't pre-empt.
- **Preview-URL Slack notifications, deploy-on-comment, deploy-on-label, etc.** Default Vercel UX is enough.
- **Vercel Analytics / Speed Insights / Web Vitals.** Plausible is the chosen analytics tool ([[../../architecture/001-stack-decisions#Plausible for analytics]]); Vercel Analytics is a paid duplicate.
- **Custom build commands or framework overrides.** Vercel's Next.js detection handles this. If it doesn't, that's the unexpected-20-minute case the appetite covers.
- **Branch protection requiring Vercel preview to succeed.** Vercel posts a status check; gating `main` on it is a one-click GitHub UI step that lives with the same branch-protection setup as the CI pitch's gate.

If the evening runs out (it shouldn't), there's only one meaningful cut: skip the test PR. The first production deploy succeeding is the proof-of-life. Preview URLs work or they don't; if the production deploy passes, they will.

The non-negotiable is *the `apps/web/` smoke screen is reachable at a public URL within the hour*.

## Sketch

Two phases — Luk's clicks, then a small commit.

### 1. Vercel UI (Luk's work)

The Vercel side is a sequence of UI steps:

1. Sign in at `vercel.com` (GitHub OAuth). If Luk doesn't have an account yet, the auth flow creates one — free Hobby tier is enough for the entire pilot.
2. *Add New → Project* → import from GitHub → select `LukV/runtime`.
3. Vercel's import wizard asks for:
   - **Framework Preset:** auto-detected as Next.js. Confirm.
   - **Root Directory:** change from repo root to `apps/web`. Click "Edit" → select `apps/web` from the tree.
   - **Build Command:** leave as default (`next build`). Vercel handles npm-workspaces dependency installation from the repo root automatically.
   - **Install Command:** leave as default (`npm install`).
   - **Output Directory:** leave as default (`.next`).
   - **Node.js Version:** confirm "20.x" (reads `.nvmrc`).
   - **Environment Variables:** none.
4. Click "Deploy". First build runs ~60 seconds. The deploy URL is `runtime-<hash>.vercel.app` or similar; Vercel assigns a canonical `runtime.vercel.app` URL too (depending on availability).
5. Visit the URL. Confirm the smoke screen from block 1 renders: wordmark, "Tempo. 8 km." headline, four ribbon instances, color swatches.

### 2. Verify preview deploys (Luk + me)

Open a tiny PR — README change or this pitch file's status flip — and watch the Vercel check post on the PR within ~90 seconds. Click the preview URL; confirm the change is reflected. That proves the per-PR preview loop works.

### 3. Commit (my work)

After the Vercel side is green:

- **`vercel.json`** at the repo root *if* the monorepo build needs explicit config. Most likely scenario: the file isn't needed. If it is, contents are minimal:
  ```json
  {
    "buildCommand": "npm --workspace apps/web run build",
    "installCommand": "npm ci",
    "outputDirectory": "apps/web/.next"
  }
  ```
  Only commit if Vercel's auto-detection doesn't handle the monorepo correctly.
- **README addendum** — a small "## Deployment" section:
  ```markdown
  ## Deployment

  Web app deploys to Vercel automatically:
  - **Production:** every push to `main` deploys to the production URL (currently `runtime.vercel.app`; `runtime.training` once DNS lands per [[docs/planning/pitches/domain-dns-email-auth]]).
  - **Previews:** every PR gets a preview URL posted as a check on the PR itself.

  No manual deploy commands. CI ([[docs/planning/pitches/github-actions-ci]]) runs in parallel against the same PRs.
  ```

That's the pitch. ~30 minutes of clicks + a small commit.

## Out of scope

- **DNS / `runtime.training` → Vercel.** Belongs to [[domain-dns-email-auth]]. The `*.vercel.app` URL is sufficient until DNS lands.
- **Resend / email / SPF / DKIM.** Same pitch.
- **Production-grade env var management** (Vercel projects → multiple environments, environment-scoped secrets). When the first secret is needed, add it via the Vercel UI then. No pre-emption.
- **Branch protection on Vercel's status check.** One-click GitHub UI setup after the first PR posts a Vercel check successfully. Same posture as CI's branch protection.
- **Vercel Analytics, Speed Insights, Web Vitals.** Free tier offers some of this; we're choosing Plausible per the architecture decision. Skip the Vercel-native versions.
- **Preview-URL comment templating, custom deploy notifications, Slack integrations.** Vercel's defaults are fine for a solo developer.
- **A dedicated `apps/web/.vercelignore`.** Default ignores (node_modules, .next, .git) cover what we need. Add if a specific file ever needs explicit exclusion.
- **Vercel CLI installation.** Not needed. Deploys happen via GitHub integration; CLI is only useful for local-only experiments which we don't need.
- **Multi-region edge deployment.** Vercel defaults to a global edge network for static assets; SSR/RSC runs in `iad1` (US East) by default. EU runtime placement is an optimization that needs traffic to justify. Revisit if Belgian latency to US East becomes user-visible (it likely won't for SSR pages cached at the edge).

## Risks / unknowns

- **Vercel's monorepo + npm-workspaces detection might require `vercel.json`.** The default expectation is that Vercel correctly reads `package.json` at the root, sees the workspaces declaration, and installs everything before running `next build` from `apps/web/`. If it doesn't (e.g., the build fails with "cannot resolve `@runtime/design-tokens`"), the fix is a minimal `vercel.json` per the sketch. Five-minute fix; flagged because it's the most likely "unexpected 20 minutes" cause.

- **`packages/design-tokens/` is consumed via workspace symlink** (`"@runtime/design-tokens": "*"` resolves to `../../packages/design-tokens/`). Vercel's build sandbox should preserve the symlink; if it doesn't, the build will fail at `import ... from '@runtime/design-tokens/wordmark'`. Same fix path as above (`vercel.json` with explicit install/build commands from the root).

- **Vercel's free Hobby tier has a 100 GB-hour build-time/month limit** — irrelevant at our scale (a 60-second build × 30 deploys/month = 30 minutes, well under any limit). Worth knowing the limit exists but no action.

- **The first production deploy URL is `runtime.vercel.app` if available, otherwise `runtime-<hash>.vercel.app`.** Either is fine until DNS replaces it. Don't get attached to the URL — it's temporary by design.

- **Vercel posts both a "Preview" check and a "Production" check** on PRs to `main` (the preview is for the PR's branch; production is what would deploy if merged). Two checks per PR plus three CI checks (from the GHA pitch) = five checks per PR. Acceptable density.

- **GitHub OAuth permission scope.** Vercel asks for repo access during the install. The minimum is "select repositories" → just `LukV/runtime`. Don't grant org-wide or all-repos access.

- **Account/billing.** Free tier is enough. Vercel does occasionally prompt for credit card on signup — decline. No paid features in this pitch's scope.

## Related

- Block: [[blocks/02-website-foundation]] — pulled out of the `domain-dns-email-auth` slot as the fast-unlock half.
- Architecture: [[../../architecture/001-stack-decisions#Web hosting]] — Vercel chosen here; this pitch is the implementation.
- Sequencing: ships *before* [[github-actions-ci]] so CI's Playwright check has a preview URL to target.
- Follow-up: [[domain-dns-email-auth]] — picks up after this, swaps the `*.vercel.app` URL for `runtime.training` and adds the email side.

---

## What actually happened

**Draft from observation — Luk to edit.**

Shipped without going through `start-pitch` / `ship-pitch` — Luk did the work in the Vercel UI in a single sitting, alongside the DNS + email setup that was originally framed as a separate pitch slot. Result is live at `https://www.runtime.training` (apex 307s to `www`). Vercel serves from `cdg1` (Paris) edge with proper HTTP/2, HSTS, prerender + edge cache. The block-1 smoke screen — wordmark, "Tempo. 8 km." headline, four ribbon instances, color swatches — renders on production exactly as it does locally.

Notably the work *folded together* with the domain slot's first half: Vercel auto-cert, DNS A + CNAME for apex/www, the apex→www redirect. The originally-pitched "small standalone Vercel pitch" became "one sitting that ate two slots' worth of work." No `vercel.json` was needed — Vercel's monorepo + npm-workspaces detection handled `apps/web/` as the root directory cleanly.

What remains separate: Resend (transactional email from the app) is deferred until the first transactional sender exists — probably the intake confirmation in block 4. The mail-auth records (SPF/DKIM/DMARC) shipped alongside this work; the Google Workspace DKIM key is at 1024-bit RSA which is acceptable but worth regenerating at 2048-bit in a future evening.
