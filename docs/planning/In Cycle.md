---
project: runtime
type: planning-current-cycle
status: active
updated: 2026-05-26
---
# In Cycle

What's being built right now. Usually one pitch at a time. If more than one is in flight, name them — but keep the list short. Discipline of one is easier than discipline of three.

When a pitch ships, move it to `pitches/shipped/` and update [[Released]] if the release boundary has been crossed.

---

## Currently in cycle

*Nothing in cycle yet.*

**Block 1 (Brand System in Code) is closed.** Tokens, fonts, and the wordmark component all shipped on 2026-05-27 — see [[pitches/shipped/design-tokens-single-source-of-truth]], [[pitches/shipped/font-integration]], [[pitches/shipped/wordmark-as-component]], and the pre-block-2 scaffold pulled forward in [[pitches/shipped/monorepo-nextjs-supabase-scaffold]].

## On deck

Block 2's remaining pitches, in [[Sequencing]] order:

1. **GitHub Actions CI** — *an evening*. Path-filtered workflows for web/api/ios + manual-trigger `migrations.yml`. Slot in [[blocks/02-website-foundation]].
2. **Domain + DNS + email auth** — *an evening*. Register `runtime.training`, point at Vercel, configure SPF/DKIM/DMARC for Resend, choose email host.
3. **Nav + footer as shared components** — *an evening*.
4. **Page chrome: SEO defaults + metadata helper** — *an evening*.
5. **Hoe het werkt + Over ons + Privacy** — *a weekend*.
6. **Plausible integration** — *an evening*.
7. **Sentry** — *an evening*.

The slot framings in [[blocks/02-website-foundation]] are detailed enough for several of these to start without a full pitch note — write the file when the shape isn't obvious.
