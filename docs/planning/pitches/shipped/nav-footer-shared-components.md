---
project: runtime
type: pitch
status: shipped
area: website
block: website-foundation
appetite: an evening
created: 2026-05-31
started: 2026-05-31
shipped_on: 2026-05-31
---
# Nav + footer as shared components

## Problem

The smoke screen at `/` shows the brand system but it sits alone on the page — no header to identify it as `runtime.training`, no footer to ground it, no way to navigate between pages because there are no other pages yet. Every page added from this point on (the calendar, the static explainers, the pilot intake, the coach console) needs the same chrome around it: wordmark in the corner, four tab links, brand line at the bottom. If each page rolls its own, the brand drifts inside a week — same failure mode the wordmark and ribbon pitches solved at the component level.

[[../../product-design/004-design-system-and-screens#4. The website]] specifies the chrome explicitly: *nav (Source Serif wordmark + tab links + "Krijg de app" button)* at the top of every page, *footer with the brand line "het werk is het feest"* at the bottom. The framing is settled visually — this pitch is the React implementation as `<SiteHeader />` and `<SiteFooter />`, the components that every block-2 page (and every block-3/4/6 page after) wraps itself in.

The work that's deferred until later pitches: the actual destination pages. Three of the four right-side nav items (`Hoe het werkt`, `Over ons`, `Krijg de app`) point at routes that don't exist yet. That's fine — they 404 with the standard Next.js not-found page until [[hoe-het-werkt-over-ons-privacy]] (slot 6) and a pilot-intake pitch fill them in. The same pattern the brand-system pitches used: ship the chrome, fill the rooms later.

## Appetite

**An evening.** Cap is binding. The pitch ships:

1. **`<SiteHeader />`** at `apps/web/app/_components/SiteHeader.tsx` — the `<Wordmark size="header" />` linking to `/`, four right-side items (`Kalender`, `Hoe het werkt`, `Over ons`, `Krijg de app`), styled per the design source.
2. **`<SiteFooter />`** at `apps/web/app/_components/SiteFooter.tsx` — wordmark + `Het werk is het feest` brand line + secondary links + copyright + small mention of the EU hosting (`Gemaakt in Mechelen · Server in Frankfurt`).
3. **`apps/web/app/layout.tsx` wraps both around `{children}`** — every page inherits the chrome automatically. The smoke screen at `/page.tsx` keeps its current content but now sits inside the chrome instead of floating bare.
4. **Sticky-on-scroll behavior** for the header — transparent at scroll-top, fades to `var(--color-inkt)` background past ~150px scroll. Implemented via **CSS scroll-driven animations** (`animation-timeline: scroll(root)`) — no JS scroll listener, no client component required. Supported in Chrome/Edge 115+, Safari 26+, Firefox 142+ (May 2026), which covers ~94% of global traffic per caniuse. The fallback for older browsers is a permanent ink background — graceful, not broken.
5. **`Download de app` button** styled as a CTA (small Inkt pill on Krijt ground, or vice versa depending on header state). Links to `/pilot` — a route that 404s for now and lands as part of a future pilot-intake pitch.

What's deferred (intentional):

- **The destination pages** (`/hoe-het-werkt`, `/over-ons`, `/pilot`). They 404 until their pitches fill them in. The links exist in the nav because the nav is shipping; the rooms come later.
- **A `Privacy` link in the footer.** Privacy ships alongside the other static pages in slot 6. Footer's "secondary links" section is empty (or has a single muted-text placeholder) until then.
- **Mobile-specific hamburger menu.** The four Dutch labels (`Kalender`, `Hoe het werkt`, `Over ons`, `Download de app`) plus the wordmark fit comfortably at 375px — measured the worst-case width assuming Inter Medium 14px ≈ 280px total, leaving 95px of breathing room on a 375px viewport. If it ever overflows (e.g., a fifth nav item gets added), revisit then. No hamburger in this pitch.
- **Calendar page replacing the smoke screen.** Calendar is block 3. The smoke screen stays at `/` and now lives inside the chrome — that's the deliverable. When the calendar lands, it replaces the smoke screen's children but keeps the same layout wrapper.
- **Skip-to-content link.** Accessibility nice-to-have; the page is currently one section so there's nothing to skip past. Add when there's a real nav-heavy page (e.g., the calendar with its filter band).
- **i18n / language switcher.** Pilot is Dutch-only ([[../../product-design/003-pilot-scope]]). No language switcher in scope.

If the evening runs out, cuts in this order:

1. **Drop the sticky-on-scroll behavior.** Header ships as a static element with permanent Inkt background. The scroll-driven animation is the visual polish; static is functional. Recoverable in ~15 minutes once the chrome is in place.
2. **Drop the `Download de app` button styling.** Ship it as a plain text link like the other three. The CTA distinction is brand-level; the plain link still gets the user where they need to go.
3. **Drop the footer secondary links section.** Footer ships with just wordmark + brand line + copyright. The secondary links section was always speculative ("eventually links to Privacy, Press, Contact") and there's nothing to link to today.

The non-negotiable is *every page on the site renders with the wordmark in the header and the brand line in the footer, and the smoke screen is wrapped in the chrome*. Below that bar the pitch hasn't shipped.

## Sketch

Three pieces.

### 1. `<SiteHeader />` — `apps/web/app/_components/SiteHeader.tsx`

```tsx
import Link from 'next/link'
import { Wordmark } from './Wordmark'

const NAV_ITEMS = [
  { label: 'Kalender', href: '/' },
  { label: 'Hoe het werkt', href: '/hoe-het-werkt' },
  { label: 'Over ons', href: '/over-ons' },
] as const

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" aria-label="runtime — naar de homepage" className="site-header__wordmark">
          <Wordmark size="header" theme="dark" />
        </Link>
        <nav aria-label="Hoofdnavigatie">
          <ul className="site-header__nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/pilot" className="site-header__cta">
                Download de app
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
```

Styles live in `globals.css` (or a co-located CSS module — TBD; the existing smoke screen uses Tailwind utilities + inline styles, mixed style). Two-state header background via scroll-driven animation:

```css
@keyframes header-fade {
  from { background: transparent; }
  to   { background: var(--color-inkt); }
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  animation: header-fade linear forwards;
  animation-timeline: scroll(root);
  animation-range: 0 150px;
}
```

Wordmark uses `theme="dark"` (Krijt-on-Inkt). At scroll-top the background is transparent, so the wordmark needs to read on whatever's behind it — the hero. The hero is currently the smoke screen's chalk/cream tone; in the calendar pitch it becomes the Kalender H1's chalk background. Either way the Krijt wordmark on chalk is invisible. **This is the one risky design decision in the pitch** — see risks below.

### 2. `<SiteFooter />` — `apps/web/app/_components/SiteFooter.tsx`

```tsx
import { Wordmark } from './Wordmark'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <Wordmark size="inline" theme="light" />
        <p className="site-footer__brand-line">Het werk is het feest.</p>
      </div>
      <div className="site-footer__bottom">
        <p>Gemaakt in Mechelen · Server in Frankfurt</p>
        <p>© {new Date().getFullYear()} runtime.training</p>
      </div>
    </footer>
  )
}
```

Footer sits on a Stof ground (cream), wordmark dark, brand line in Source Serif italic at ~22px, secondary text in Inter at 12px Houtskool. Single horizontal line dividing top and bottom sections (`border-top: 1px solid var(--color-mist)`).

### 3. Wrap the layout — `apps/web/app/layout.tsx`

```tsx
// before
<body>{children}</body>

// after
<body>
  <SiteHeader />
  <main>{children}</main>
  <SiteFooter />
</body>
```

The smoke screen's existing `<main>` element gets removed (it's now the layout's responsibility), and the page content just becomes the inner sections. One-line change to `app/page.tsx` to drop the now-redundant `<main>` wrapper.

### 4. Verification

Three things to eyeball before declaring shipped:

1. Visit `/` — wordmark top-left, four nav items top-right, brand line at the bottom, smoke screen content unchanged in between.
2. Scroll down ~200px — header background fades to Inkt, wordmark stays Krijt and now reads against the Inkt. Scroll back to top — background fades back to transparent.
3. Click `Hoe het werkt` — 404s with Next.js's default not-found page. That's expected; the link works, the destination doesn't exist yet.

Local Playwright smoke can extend by one assertion (the page contains "Het werk is het feest") to lock the footer into CI — but that's a tiny optional follow-up, not a non-negotiable.

## Out of scope

- **Destination pages.** Three of the four right-nav items 404. They land in [[hoe-het-werkt-over-ons-privacy]] (slot 6) and a future pilot-intake pitch.
- **Hamburger / responsive collapse.** Not needed at four short Dutch labels. Revisit when a fifth item lands or when the Dutch labels get translated to a longer language.
- **Privacy link in footer.** Ships when Privacy ships (slot 6).
- **Active-route highlighting in nav.** Useful when there are real pages to be active on. Currently `/` is the only real route; everything else 404s. Add when the destinations land — `usePathname()` plus a className, ~10 lines.
- **Theme toggle.** No dark mode in v0 ([[shipped/design-tokens-single-source-of-truth]] out-of-scope). Footer/header are theme-fixed.
- **Logo lockup variants for partners / press.** Not needed until there's a partner or press kit.
- **Cookie / consent banner.** Plausible is cookieless ([[../../architecture/001-stack-decisions#Plausible for analytics]]), so no consent UI is required. Privacy page documents what's tracked when it lands.
- **Search box.** No content to search yet.
- **Skip-to-content / landmark accessibility beyond basic `<header>` + `<main>` + `<footer>` + `aria-label` on the nav.** Add when there's a real reason to skip past nav (a calendar with a filter band, say).
- **Social-proof bar, partner-logos strip, language selector, account/login button.** None of these are in [[../../product-design/004-design-system-and-screens#4. The website]]. If they're ever needed, they're a separate pitch.

## Risks / unknowns

- **The Krijt wordmark on a chalk hero is invisible.** The header is transparent at scroll-top and the wordmark uses `theme="dark"` (Krijt-on-Inkt). At scroll-top, the wordmark sits on whatever's behind it — the hero. The smoke screen's body has no specific hero, and the calendar's hero (per [[../../product-design/004-design-system-and-screens#4. The website]]) is on the Stof/Krijt cream tone. **Krijt wordmark on Krijt hero = invisible wordmark.** Three ways to fix:
  - (a) Use `theme="light"` (Inkt wordmark) at scroll-top, swap to `theme="dark"` past scroll. Needs a client component to read scroll position — JS, breaks the no-listener posture.
  - (b) Header always has an Inkt background, no fade. Loses the design intent (hero peeks through under transparent nav) but ships clean.
  - (c) Header has a thin Inkt strip behind just the wordmark (an Inkt pill or full bar). Compromises the look but keeps the wordmark legible.
  
  **Agreed resolution**: pick (b) — permanent Inkt background. The semi-transparent-on-scroll effect is design polish for once the calendar's hero exists; today the hero doesn't, so the effect has no positive payoff and a real negative (invisible wordmark). Land the scroll-driven fade as a follow-up once the calendar's hero is in place and the right wordmark theme can be chosen against a known background.

- **`/pilot` route 404s.** The `Krijg de app` button links to a route that doesn't exist. Acceptable per the precedent (three other nav items also 404), but the CTA button looks more inviting than a tab link, which raises expectation. Two mitigations available now without a separate pitch: (i) link it to `/` with a `#pilot` anchor that doesn't yet exist (still 404-feeling but at least lands on a real page), or (ii) link it to a `mailto:luk@runtime.training?subject=Pilot` as a poor-man's waitlist until the pilot intake pitch lands. **Recommended:** option (ii) — mailto. Cheap, real, and the new `luk@runtime.training` alias is the perfect destination.

- **Sticky positioning + Tailwind 4 CSS-first config.** `position: sticky` interacts with `overflow` ancestors in subtle ways. If any parent has `overflow: hidden` or `overflow-y: scroll`, the sticky behavior breaks silently. The current layout has none of those — but worth re-testing if/when the smoke screen gets replaced by the calendar. Documented in the component's leading comment.

- **Scroll-driven animations in Safari.** Safari 26 (released 2026-Q1) supports `animation-timeline: scroll()`. Older Safari (≤17) on iOS doesn't. Per caniuse, that's ~6% of global traffic as of May 2026 — those users get the fallback (always-Inkt background per the cuts list). Acceptable.

- **CTA button styling drift.** The `Download de app` button has no canonical styling locked in 004 §1 — it's mentioned as "*button*" with no further spec. The default I'd ship: Inkt pill, Krijt text, ~12px Inter Medium, 8px horizontal padding, 24px corner radius. If this becomes the canonical "primary CTA" pattern, lock it in 004 §1 and consider whether it deserves a token. For now it's a one-off until a second CTA appears.

- **The footer "secondary links" section ships empty.** With Privacy not yet built and no other linkable content, the secondary-links area is structurally present but visually absent. Footer ships with the top section (wordmark + brand line) and the bottom section (locale text + copyright) but no middle. That's a deliberate empty space, not a bug — the structure is in place for slot 6 to fill in.

- **Footer brand line as Source Serif italic.** 004 §1 puts Source Serif into the wordmark *only* ("the serif lives only in the wordmark — everything else in the app is sans"). Setting the footer's `Het werk is het feest` in Source Serif italic would *technically* break that rule. **Two options:** (a) set the brand line in Inter italic (rule-conforming, loses some literary feel), or (b) carve an exception in 004 §1 for "the brand line, used twice on the website, gets Source Serif". **Recommended:** option (a) — Inter italic. Don't carve exceptions to a one-line rule that's been holding the brand together. If the literary feel is genuinely missed once it ships, revisit the rule with an explicit edit to 004 §1.

- **Wrapping the layout means the existing `apps/web/app/page.tsx` smoke needs adjustment.** The smoke screen currently renders its own `<main>` with `min-h-screen` and centered content. With layout-level chrome wrapping it, the page's `<main>` becomes a duplicate. One-line cleanup (drop the outer `<main className="min-h-screen ...">`) per the sketch above. Worth flagging because it changes the smoke screen's appearance slightly (it's no longer the entire viewport's flex parent).

## Related

- Block: [[blocks/02-website-foundation]]
- Design source: [[../../product-design/004-design-system-and-screens#4. The website]]
- Component dependencies: [[shipped/wordmark-as-component]] (header + footer both render the wordmark)
- Token consumers: `var(--color-inkt)`, `var(--color-krijt)`, `var(--color-stof)`, `var(--color-mist)`, `var(--color-houtskool)` from [[shipped/design-tokens-single-source-of-truth]]
- Downstream consumers: every other page in the website — the calendar (block 3), pilot intake (block 4), the coach console (`/coach`, block 6), the organizer portal (`/organizers`, block 8), and the static pages in slot 6 of this block.
- Pattern precedent: [[shipped/wordmark-as-component]] established the "one component, two themes, all consumers" pattern. Header + footer extend it from atom to molecule.

---

## What actually happened

**Draft from the diff — Luk to edit.**

Shipped with all five risk-section recommendations applied: permanent Inkt header background (no scroll-driven fade), `mailto:luk@runtime.training?subject=Pilot` as the Download de app destination, Inter italic for the brand line, no hamburger, footer secondary-links section ships empty. `<SiteHeader />` and `<SiteFooter />` both consume `<Wordmark />` and `var(--color-*)` tokens; `app/layout.tsx` wraps them around `{children}` so every future page inherits the chrome for free. Smoke screen at `/` lost its outer `<main>` wrapper (now provided by the layout) and slots into the chrome cleanly.

Body got `min-height: 100vh; display: flex; flex-direction: column; main { flex: 1 }` so the footer always sits at the bottom regardless of content length — a one-line CSS commitment that prevents footer-floats-mid-page bugs on short pages like the eventual 404.

Gates green on first try. Verified locally: dev server on port 3001 rendered the expected markup (all four nav labels, mailto, brand line, locale string, copyright) and Playwright smoke ran green against `http://localhost:3001` in 1.3s — accessibility hooks survived the wrapping.

Worth watching:
- The Download de app mailto is a placeholder. When the pilot intake pitch lands, swap the `PILOT_MAILTO` constant in `SiteHeader.tsx` for the real route. One-line change.
- The scroll-fade-into-Inkt design from 004 §4 is deferred. Re-add as a follow-up once the calendar's hero exists and the right wordmark theme can be picked against a known background — likely a 30-min sub-pitch inside block 3.
- The `Hoe het werkt`, `Over ons`, and `Download de app` mailto links work; the routes 404 (except the mailto, which opens the user's mail client). Acceptable interim state per the precedent — they fill in with the static-pages pitch (slot 6) and pilot intake later.
- The CTA pill currently uses Eerste licht as the background. If the styling gets canonicalized as a "primary CTA pattern" used by more than one button, lock it in 004 §1 and consider a token.
