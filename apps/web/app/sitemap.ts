import type { MetadataRoute } from 'next'
import { siteMetadata } from '@/lib/site-metadata'

// The three nav destinations. /hoe-het-werkt and /over-ons 404 today — they
// land in the static-pages slot of this same block. Listing them now means the
// first Google crawl already knows the routes; if a crawl beats the pages, the
// 404s re-crawl and self-correct within days. When race pages arrive in block 3
// this file gains a dynamic `wedstrijden` map.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-05-31') // bump on real content changes
  return [
    { url: `${siteMetadata.baseUrl}/`, lastModified, priority: 1.0 },
    { url: `${siteMetadata.baseUrl}/hoe-het-werkt`, lastModified, priority: 0.8 },
    { url: `${siteMetadata.baseUrl}/over-ons`, lastModified, priority: 0.7 },
  ]
}
