---
project: runtime
type: pitch
area: website
block: website-foundation
appetite: an evening
created: 2026-05-31
started: 2026-06-01
status: shipped
shipped_on: 2026-06-01
---
# Page chrome — SEO defaults + metadata helper

## Problem

Right now every page on `runtime.training` ships with the same generic metadata: `<title>runtime.training</title>` from the layout's default export. There's no Open Graph image, no Twitter card, no canonical URL, no Schema.org markup, no favicon, no `robots.txt`, no `sitemap.xml`. The site is functionally invisible to search, and any link shared on Slack/X/LinkedIn renders as a bare URL with no card.

This wouldn't matter for most projects in week one. It matters here because the whole product thesis is *calendar SEO* — runners find `runtime.training` via hyper-local searches (*"stadsloop mechelen 2026"*, *"joggings antwerpen augustus"*) and land directly on a race page ([[../../product-design/004-design-system-and-screens#4. The website]]). Every race-page URL is a search-entry-point, every shared link to the homepage is a credibility check. The chrome isn't optional infrastructure — it's the conversion machinery.

The work itself is small. Next.js 15's metadata API does ~80% of it declaratively, and the remaining ~20% (OG image generation, JSON-LD injection, sitemap dynamism) ships in a few well-known patterns. The slot framing in [[blocks/02-website-foundation]] settled the *what* (title template, description, OG image, Twitter card, Schema.org); this pitch settles the *how* and lands it as runnable code that block-3's calendar can extend without rewriting the foundation.

## Appetite

**An evening.** Cap is binding. The pitch ships:

1. **`apps/web/lib/site-metadata.ts`** — a single `siteMetadata` export holding the canonical site facts (name, URL, default description, locale, social handles when they exist), plus a `pageMetadata({ title?, description?, path? })` helper that returns a typed Next.js `Metadata` object with defaults merged. Consumers in calendar/intake/coach pages call `export const metadata = pageMetadata({ title: 'Kalender', path: '/' })` and get the right title template, canonical URL, OG inheritance for free.
2. **`apps/web/app/layout.tsx`** uses `pageMetadata()` for its default metadata block, replacing the current ad-hoc literal. Title template `'%s · runtime.training'` becomes the layout-level default; the bare homepage gets `'runtime.training'` (no suffix) via a sentinel.
3. **`apps/web/app/opengraph-image.tsx`** — Next.js 15's static-OG-image pattern. 1200×630 dark Inkt ground with the wordmark centered (Krijt + Eerste-licht period), reading "runtime.training" in Source Serif. Generated at build time via `next/og` (no runtime cost, no @vercel/og deploy dep). Same file doubles as Twitter card (`twitter:image` resolves to `opengraph-image` by default).
4. **`apps/web/app/robots.ts`** — allows all crawlers, points at the sitemap. Two-line file.
5. **`apps/web/app/sitemap.ts`** — yields `/` and `/hoe-het-werkt` and `/over-ons` as static entries (the latter two 404 today but will land in slot 6 and crawlers benefit from knowing they exist). When race pages land in block 3, this file gains a dynamic `wedstrijden` map; the pattern is in place from this pitch.
6. **`apps/web/app/_components/JsonLd.tsx`** — a tiny server component that inlines `<script type="application/ld+json">` with an `Organization` schema for the site (name, URL, logo, foundingDate, founder). Imported once in `layout.tsx` so every page carries the org schema. Per-page schemas (`SportsEvent` for races, `Article` for explainers) come in their own pitches and extend this pattern.

What's deferred (intentional):

- **Favicon export** (`favicon.ico`, `apple-touch-icon.png`, the various sizes for PWA install hints). The icon master SVG already exists at `packages/design-tokens/icons/app-icon.svg`; favicon is *a different export pipeline*, not a metadata concern. Lands as a small follow-up pitch (~15 min — generate from the master SVG, drop into `apps/web/app/`).
- **`SportsEvent` JSON-LD for races.** No race pages exist yet. Ships with the calendar pitch in block 3.
- **`Article` JSON-LD for explainers.** No explainer pages exist yet. Ships with the static-pages pitch (slot 6 of this block).
- **Per-route OG image generation** (different cards per race). Single static image now. Per-race dynamic OGs land with the calendar pitch — pattern (`opengraph-image.tsx` per route) is identical to what this pitch establishes.
- **Plausible site verification meta tag.** Plausible doesn't require a verification meta — it verifies via the script tag itself. Ships with the Plausible pitch (slot 7).
- **`hreflang` tags for i18n.** Pilot is Dutch-only ([[../../product-design/003-pilot-scope]]). When/if English lands, this is a layout-level addition.
- **Google Search Console verification.** Worth doing once a real domain is in place — but a verification meta tag is a one-line addition the day Luk wants to set GSC up. Not in this pitch because GSC isn't urgent for v0.2.
- **`<link rel="manifest">` (PWA install).** No PWA scope until iOS lands.

If the evening runs out, cuts in this order:

1. **Drop the `JsonLd` component and inline a literal `<script type="application/ld+json">` tag in `layout.tsx`.** The component is hygiene; the script tag does the actual work. ~5-minute path back to the component pattern when it matters.
2. **Drop the dynamic `opengraph-image.tsx` generator** and ship a static `public/og-default.png` generated once from a one-off script (or hand-exported from the design SVG). Same outcome, no `next/og` dep. Roughly ~15 minutes saved.
3. **Drop `sitemap.ts`.** Search engines will discover routes via crawl when they exist. The sitemap is an optimization for when routes are dense (race pages, distance pages, province pages — block 3+). Recovers a tiny amount of time; skip if pressed.

The non-negotiable is *a shared link to `https://www.runtime.training` renders a proper OG card in Slack/X/LinkedIn, and `view-source` on the homepage shows a populated `<head>` with title, description, canonical, OG, and Organization JSON-LD*. Below that bar the pitch hasn't shipped.

## Sketch

Five small files.

### 1. `apps/web/lib/site-metadata.ts`

```typescript
import type { Metadata } from 'next'

export const siteMetadata = {
  name: 'runtime.training',
  baseUrl: 'https://www.runtime.training',
  defaultTitle: 'runtime.training',
  titleTemplate: '%s · runtime.training',
  defaultDescription:
    'Een trainingsplan dat zich aanpast aan jouw week — en jouw doelwedstrijd.',
  locale: 'nl_BE',
  themeColor: '#0D1014', // Inkt — for browser chrome on Android
} as const

interface PageMetadataInput {
  title?: string
  description?: string
  path?: string // canonical path, e.g. '/wedstrijd/stadsloop-mechelen-2026'
  noIndex?: boolean // for /pilot intake confirmations, etc
}

export function pageMetadata({
  title,
  description,
  path = '/',
  noIndex = false,
}: PageMetadataInput = {}): Metadata {
  const canonical = `${siteMetadata.baseUrl}${path}`
  const resolvedDescription = description ?? siteMetadata.defaultDescription

  return {
    metadataBase: new URL(siteMetadata.baseUrl),
    title: title
      ? { absolute: title === siteMetadata.name ? title : `${title} · ${siteMetadata.name}` }
      : siteMetadata.defaultTitle,
    description: resolvedDescription,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: title ?? siteMetadata.defaultTitle,
      description: resolvedDescription,
      siteName: siteMetadata.name,
      locale: siteMetadata.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: title ?? siteMetadata.defaultTitle,
      description: resolvedDescription,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  }
}
```

The helper is the *only* place that knows about title concatenation, canonical computation, and default-fallback logic. Pages call it with their specific bits; nothing else duplicates the pattern.

### 2. `apps/web/app/layout.tsx` — wire the helper in

```typescript
import { pageMetadata } from '@/lib/site-metadata'

export const metadata = pageMetadata()
// ...
```

One-line replacement of the current `Metadata` literal. The layout-level default applies to every page until a page overrides.

### 3. `apps/web/app/opengraph-image.tsx`

Next 15's `next/og` lets you author the OG image as a React component that renders to an image at build time. 1200×630 dark Inkt ground; the wordmark renders by importing the existing `WORDMARK_PATH` from `@runtime/design-tokens/wordmark` (the same artefact `<Wordmark />` uses).

```typescript
import { ImageResponse } from 'next/og'
import { WORDMARK_PATH, WORDMARK_PERIOD, WORDMARK_VIEWBOX } from '@runtime/design-tokens/wordmark'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const aspect = WORDMARK_VIEWBOX.width / WORDMARK_VIEWBOX.height
  const wordmarkHeight = 140
  const wordmarkWidth = wordmarkHeight * aspect

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0D1014',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={wordmarkWidth}
          height={wordmarkHeight}
          viewBox={`${WORDMARK_VIEWBOX.x} ${WORDMARK_VIEWBOX.y} ${WORDMARK_VIEWBOX.width} ${WORDMARK_VIEWBOX.height}`}
          fill="#F6F5F1"
        >
          <path d={WORDMARK_PATH} />
          <circle cx={WORDMARK_PERIOD.cx} cy={WORDMARK_PERIOD.cy} r={WORDMARK_PERIOD.r} fill="#E8A65A" />
        </svg>
      </div>
    ),
    size,
  )
}
```

This file's existence is itself the "register an OG image for this route" — Next.js picks it up by file convention. Twitter card uses the same image by default unless `twitter-image.tsx` exists alongside.

### 4. `apps/web/app/robots.ts` + `apps/web/app/sitemap.ts`

```typescript
// robots.ts
import { siteMetadata } from '@/lib/site-metadata'

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteMetadata.baseUrl}/sitemap.xml`,
  }
}

// sitemap.ts
import { siteMetadata } from '@/lib/site-metadata'

export default function sitemap() {
  const lastModified = new Date('2026-05-31') // bump on real content changes
  return [
    { url: `${siteMetadata.baseUrl}/`, lastModified, priority: 1.0 },
    { url: `${siteMetadata.baseUrl}/hoe-het-werkt`, lastModified, priority: 0.8 },
    { url: `${siteMetadata.baseUrl}/over-ons`, lastModified, priority: 0.7 },
  ]
}
```

Sitemap lists the three nav destinations even though two of them 404 today — by the time Google crawls and indexes, the static-pages pitch will have shipped (in this same block). If the crawl beats slot 6, the 404s self-correct within hours.

### 5. `apps/web/app/_components/JsonLd.tsx` + layout integration

```typescript
// JsonLd.tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// in layout.tsx, inside <body>:
<JsonLd
  data={{
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'runtime.training',
    url: 'https://www.runtime.training',
    logo: 'https://www.runtime.training/opengraph-image',
    founder: { '@type': 'Person', name: 'Luk Vandenbroucke' },
    foundingLocation: { '@type': 'Place', address: { addressLocality: 'Mechelen', addressCountry: 'BE' } },
  }}
/>
```

`dangerouslySetInnerHTML` is required for `<script>` content in React — the rendered output is a string literal, not interpreted markup, so the "danger" is purely a naming convention. `JSON.stringify` handles any escaping safely.

### Verification

Three things to eyeball before declaring shipped:

1. `view-source:http://localhost:3000` shows: populated `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta property="og:*">` cluster, `<meta name="twitter:*">` cluster, `<script type="application/ld+json">` with the Organization schema.
2. `https://www.opengraph.xyz/url/http%3A%2F%2Fwww.runtime.training` (or paste the URL into Slack — easier) shows the OG card rendering correctly.
3. `https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.runtime.training` confirms the JSON-LD parses and Google recognizes the Organization schema.

The Playwright smoke can gain one assertion (`expect(page.locator('meta[property="og:image"]')).toHaveCount(1)`) — small one-line addition, locks the OG-image-exists check into CI.

## Out of scope

- **Favicon export.** Different pipeline; small follow-up pitch (~15 min) that generates `favicon.ico` + `apple-touch-icon.png` + the various PWA sizes from `packages/design-tokens/icons/app-icon.svg`. Not in this pitch's surface area.
- **Per-page Schema.org schemas** (`SportsEvent`, `Article`, `Person`, `WebPage`). They land in the pitches that create the pages they describe.
- **Per-route dynamic OG images** (custom card per race, per article). Pattern is the same `opengraph-image.tsx` mechanism — extends by adding the file to the route folder. Block 3 territory.
- **Sitemap auto-generation from a content source** (e.g., reading race pages from Supabase and emitting their URLs). The static stub-list works today; block 3's calendar pitch upgrades it to dynamic.
- **JSON-LD validation in CI.** A nice-to-have. Google's rich-results test isn't easily scriptable from CI; an alternative is `schema-dts-gen` for type-safe schema construction. Worth considering when there's more than one schema type. Defer.
- **Open Graph article tags** (`article:published_time`, `article:author`). Comes with the article-style pages in slot 6.
- **GSC verification meta tag.** When Luk wants to set up Search Console, one-line addition to `pageMetadata`'s default. Not pre-empted because the choice of when to start watching search performance is editorial, not technical.
- **Plausible verification.** Plausible verifies via the script tag — no separate meta needed. Ships with the Plausible pitch.
- **Localization of OG card text.** Single Dutch site; OG card carries no text beyond the wordmark itself. Nothing to localize.
- **`og:image:alt` per-route customization.** A single alt text is fine for the single OG image. When per-route OGs land, per-route alt comes with.

## Risks / unknowns

- **`next/og` build-time generation pulls in Satori (a small SVG-to-PNG renderer) at build time.** That adds ~30s to the cold build and ~3MB to the build artifact. Both are within Vercel's free-tier limits and only matter once we're optimizing. Mitigation: if the build slows materially, the cut-path (ship `public/og-default.png` statically) recovers the time at the cost of static-vs-dynamic flexibility.

- **The OG image generated at build will look slightly different from the live wordmark.** Satori's text rendering doesn't have access to the same font-rendering pipeline the browser uses, and the wordmark here is rendered as outlined SVG paths (which Satori handles fine, as those are vector geometry, not text). The amber period uses the same hardcoded `#E8A65A` as the live SVG. Should be visually identical; flagging for honest review.

- **`metadataBase` is required for Next 15 to resolve relative URLs.** If we forget to set it, Next emits a warning and falls back to `localhost:3000` — which would put `http://localhost:3000/og-image.png` into production OG tags. The `pageMetadata` helper sets `metadataBase` explicitly so this can't happen.

- **`alternates.canonical` value subtlety.** A canonical URL with trailing slash vs no trailing slash matters to Google. Vercel serves `https://www.runtime.training/` (with trailing slash) at root; `pageMetadata({ path: '/' })` produces `https://www.runtime.training/` (matches). For sub-routes, e.g. `/hoe-het-werkt` with no trailing slash, both Vercel and the helper agree (no trailing slash). Worth testing on the first sub-route that ships.

- **Schema.org `Organization` vs `LocalBusiness` vs `WebSite`.** I'm choosing `Organization` because runtime is a company-shaped thing more than a local business; the alternative `WebSite` schema is too thin (just a name + URL) and `LocalBusiness` implies a physical premises that customers visit, which doesn't fit. If Google's rich-results test prefers a different schema for our use case, easy swap.

- **`apps/web/app/_components/` vs `apps/web/lib/` location for shared code.** `_components` is for React components (used by JSX). The `pageMetadata` helper isn't a component — it's a pure function returning data. Putting it in `lib/` follows the Next.js convention. New directory, but small and conventional.

- **`@/` path alias for imports.** The current code uses relative imports (e.g., `./_components/Wordmark`). To import from `lib/`, we either use `../lib/site-metadata` (works but ugly from `app/`) or set up a `@/` path alias in `tsconfig.json` and `next.config.ts`. **Recommendation:** add the `@/` alias mapping to `app/lib/` — Next.js handles this natively as of v13+, no config change needed beyond `tsconfig.json` `paths`. ~3-line change to `tsconfig.json`.

- **`<script type="application/ld+json">` placement.** Best practice is `<head>`, but React's `<head>` integration is tightening — putting custom scripts in `<head>` from a layout component requires the `<head>` export or `next/script` strategy='beforeInteractive'. **Simpler approach for this pitch:** place the `<JsonLd />` component inside `<body>` (works for SEO; Googlebot reads JSON-LD anywhere in the document). Migrate to `<head>` placement if SEO tooling ever flags it.

- **The OG image references the wordmark via hardcoded Inkt/Krijt/Eerste-licht hex codes** rather than tokens. That's because the OG image runs in the edge runtime where token resolution from CSS variables isn't available. The hex codes are the same constants the master design source uses (locked in `tokens.json`). If a token color ever changes, the OG image needs regeneration — flag this in a comment.

- **Sitemap lists `/hoe-het-werkt` and `/over-ons` which currently 404.** Calculated bet: by the time Google crawls (typically 24–72h after submission), slot 6 will have shipped (this block is one evening per slot, and we're at slot 6 out of 8). If the timing is wrong, Google's first crawl gets 404s — they get re-crawled within days. Mitigation: if we end up needing more than a week between this pitch and slot 6, gate the two URLs out of the sitemap with a flag.

## Related

- Block: [[blocks/02-website-foundation]]
- Design source: [[../../product-design/004-design-system-and-screens#4. The website]]
- Architecture: [[../../architecture/001-stack-decisions]] — Vercel hosting, Plausible analytics (separate pitch).
- Token consumer: `WORDMARK_PATH`, `WORDMARK_PERIOD`, `WORDMARK_VIEWBOX` from [[shipped/wordmark-as-component]] (the OG image renders the same outlined wordmark).
- Pattern precedent: [[shipped/nav-footer-shared-components]] established the layout-level chrome pattern that this pitch's metadata default extends.
- Downstream consumers:
  - [[hoe-het-werkt-over-ons-privacy]] — calls `pageMetadata({ title: 'Hoe het werkt', path: '/hoe-het-werkt' })` per page.
  - [[blocks/03-race-calendar]] — per-race `opengraph-image.tsx` and `SportsEvent` JSON-LD using the patterns this pitch establishes.
  - [[blocks/04-pilot-intake]] — `pageMetadata({ noIndex: true })` for intake confirmation pages.
- Deferred follow-ups:
  - *Favicon + apple-touch-icon export* — ~15 min pitch.
  - *Google Search Console verification* — when ready to monitor.

---

## What actually happened

All six files shipped as specced — the `pageMetadata()` helper, the layout default + Organization JSON-LD, the build-time OG image, `robots.ts`, `sitemap.ts`, and the `JsonLd` component — plus the `og:image` smoke assertion. Verified against a production build: the homepage `<head>` carries title, description, canonical, the full OG + Twitter clusters and the Organization schema; `/robots.txt`, `/sitemap.xml`, and `/opengraph-image` all return 200; the OG card renders correctly (Krijt wordmark on Inkt, amber period). Two deviations from the sketch, both toward the pitch's own intent: dropped `export const runtime = 'edge'` (it made the OG route on-demand `ƒ`, contradicting the "build-time, no runtime cost" goal — without it the card prerenders static `○`); and embedded the wordmark as an SVG data-URI `<img>` rather than inline `<svg>`, sidestepping the Satori inline-`<path>` risk the pitch flagged. No cuts — the evening held; the cut-list (favicon, per-route OG, GSC, Plausible verify) stays deferred as planned. To watch: the canonical renders without a trailing slash (Next normalised it against `metadataBase`) — worth confirming against Vercel's actual serving behaviour on the first sub-route in slot 6.
