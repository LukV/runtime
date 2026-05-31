---
project: runtime
type: planning-current-cycle
status: active
updated: 2026-05-31
---
# In Cycle

What's being built right now. Usually one pitch at a time. If more than one is in flight, name them — but keep the list short. Discipline of one is easier than discipline of three.

When a pitch ships, move it to `pitches/shipped/` and update [[Released]] if the release boundary has been crossed.

---

## Currently in cycle

*Nothing in cycle yet.*

**Block 1 fully shipped on 2026-05-30** (v0.1.0 + v0.2.0). **Block 2 is in progress** — three slots shipped (monorepo scaffold pulled forward in block 1; Vercel project setup + domain/DNS/mail-auth shipped together 2026-05-31). Site is live at https://www.runtime.training.

See the on-deck list below for the next pickup.

## On deck

Block 2's queue. Order:

### Block 2 — website foundation

1. **GitHub Actions CI** — *an evening* — [[pitches/github-actions-ci|pitch drafted]]. Path-filtered `ci.yml` with active `web-ci` (lint + typecheck + build + Playwright smoke against the Vercel preview) and stub `api-ci`/`ios-ci` jobs that wake up when their dirs land.
2. **Nav + footer as shared components** — *an evening*.
3. **Page chrome: SEO defaults + metadata helper** — *an evening*.
4. **Hoe het werkt + Over ons + Privacy** — *a weekend*.
5. **Plausible integration** — *an evening*.
6. **Sentry** — *an evening*.

The slot framings in [[blocks/02-website-foundation]] are detailed enough for several of these to start without a full pitch note — write the file when the shape isn't obvious.

### Optional follow-ups (no pitch yet)

- **DKIM regenerate at 2048-bit + ratchet DMARC to `p=quarantine`** — *15 min*. Future evening when aggregate reports have been observed for ~2 weeks.
- **Supabase project + `migrations.yml` workflow** — separate pitch when the first migration exists (probably block 4 or 6).
- **Resend setup + transactional email DKIM selector** — separate pitch when the first transactional sender exists (likely block 4 intake confirmations).
