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

**Block 2: 4 of 8 slots shipped.** Monorepo scaffold (2026-05-27), Vercel + domain/DNS/mail-auth (2026-05-31), CI (2026-05-31). Site live, mail-auth records published, CI wired with Playwright smoke against production. Nav + footer is next.

See the on-deck list below for the next pickup.

## On deck

Block 2's queue. Order:

### Block 2 — website foundation

1. **Nav + footer as shared components** — *an evening*.
2. **Page chrome: SEO defaults + metadata helper** — *an evening*.
3. **Hoe het werkt + Over ons + Privacy** — *a weekend*.
4. **Plausible integration** — *an evening*.
5. **Sentry** — *an evening*.

The slot framings in [[blocks/02-website-foundation]] are detailed enough for several of these to start without a full pitch note — write the file when the shape isn't obvious.

### Optional follow-ups (no pitch yet)

- **DKIM regenerate at 2048-bit + ratchet DMARC to `p=quarantine`** — *15 min*. Future evening when aggregate reports have been observed for ~2 weeks.
- **Supabase project + `migrations.yml` workflow** — separate pitch when the first migration exists (probably block 4 or 6).
- **Resend setup + transactional email DKIM selector** — separate pitch when the first transactional sender exists (likely block 4 intake confirmations).
