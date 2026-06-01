import type { MetadataRoute } from 'next'
import { siteMetadata } from '@/lib/site-metadata'

// The nav destinations plus privacy, all live as of the static-pages slot.
// When race pages arrive in block 3 this file gains a dynamic `wedstrijden`
// map.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-05-31') // bump on real content changes
  return [
    { url: `${siteMetadata.baseUrl}/`, lastModified, priority: 1.0 },
    { url: `${siteMetadata.baseUrl}/hoe-het-werkt`, lastModified, priority: 0.8 },
    { url: `${siteMetadata.baseUrl}/over-ons`, lastModified, priority: 0.7 },
    { url: `${siteMetadata.baseUrl}/meebouwen`, lastModified, priority: 0.6 },
    { url: `${siteMetadata.baseUrl}/privacy`, lastModified, priority: 0.3 },
  ]
}
