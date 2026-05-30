---
project: runtime
type: planning-current-cycle
status: active
updated: 2026-05-30
---
# In Cycle

What's being built right now. Usually one pitch at a time. If more than one is in flight, name them — but keep the list short. Discipline of one is easier than discipline of three.

When a pitch ships, move it to `pitches/shipped/` and update [[Released]] if the release boundary has been crossed.

---

## Currently in cycle

*Nothing in cycle yet.*

See the on-deck list below for the next pickup.

## On deck

Block 1's last slot, then block 2's queue. Order:

### Block 1 — finishing the brand system in code

1. **App icon assets at every size** — *an evening* — [[pitches/app-icon-assets-at-every-size]]. Master SVG + export pipeline emitting PNGs at every Apple-required size to `packages/design-tokens/dist/icons/` with a manifest. `Assets.xcassets` catalog wiring happens at the start of block 5 as a five-minute follow-up; this pitch ships everything *but* the wiring because `apps/ios/` doesn't exist yet.

### Block 2 — website foundation

In [[Sequencing]] order:

1. **GitHub Actions CI** — *an evening*. Path-filtered workflows for web/api/ios + manual-trigger `migrations.yml`. Slot in [[blocks/02-website-foundation]].
2. **Domain + DNS + email auth** — *an evening*. Register `runtime.training`, point at Vercel, configure SPF/DKIM/DMARC for Resend, choose email host.
3. **Nav + footer as shared components** — *an evening*.
4. **Page chrome: SEO defaults + metadata helper** — *an evening*.
5. **Hoe het werkt + Over ons + Privacy** — *a weekend*.
6. **Plausible integration** — *an evening*.
7. **Sentry** — *an evening*.

The slot framings in [[blocks/02-website-foundation]] are detailed enough for several of these to start without a full pitch note — write the file when the shape isn't obvious.
