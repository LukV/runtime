import type { Metadata } from 'next'

// The canonical facts about the site, in one place. Everything that builds a
// <head> — the layout default, per-page overrides, robots, sitemap, JSON-LD —
// reads from here so the URL, name, and description never drift.
export const siteMetadata = {
  name: 'runtime.training',
  baseUrl: 'https://www.runtime.training',
  defaultTitle: 'runtime.training',
  titleTemplate: '%s · runtime.training',
  defaultDescription:
    'Een trainingsplan dat zich aanpast aan jouw week — en jouw doelwedstrijd.',
  locale: 'nl_BE',
  themeColor: '#0D1014', // Inkt — browser chrome on Android
} as const

interface PageMetadataInput {
  /** Page title, slotted into the `%s · runtime.training` template. */
  title?: string
  /** Overrides the default site description for this page. */
  description?: string
  /** Canonical path, e.g. '/wedstrijd/stadsloop-mechelen-2026'. */
  path?: string
  /** Set on pages that should stay out of the index — intake confirmations, etc. */
  noIndex?: boolean
}

// The single place that knows how a title is concatenated, how the canonical
// URL is computed, and how defaults fall back. Pages call it with their own
// bits and inherit everything else:
//
//   export const metadata = pageMetadata({ title: 'Kalender', path: '/' })
//
export function pageMetadata({
  title,
  description,
  path = '/',
  noIndex = false,
}: PageMetadataInput = {}): Metadata {
  const canonical = `${siteMetadata.baseUrl}${path}`
  const resolvedDescription = description ?? siteMetadata.defaultDescription
  // The bare homepage reads 'runtime.training' with no suffix; every other
  // page gets '{title} · runtime.training'.
  const resolvedTitle = title
    ? title === siteMetadata.name
      ? title
      : `${title} · ${siteMetadata.name}`
    : siteMetadata.defaultTitle

  return {
    metadataBase: new URL(siteMetadata.baseUrl),
    title: { absolute: resolvedTitle },
    description: resolvedDescription,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: resolvedTitle,
      description: resolvedDescription,
      siteName: siteMetadata.name,
      locale: siteMetadata.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  }
}
