import localFont from 'next/font/local'
import { Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SiteHeader } from './_components/SiteHeader'
import { SiteFooter } from './_components/SiteFooter'
import { JsonLd } from './_components/JsonLd'
import { pageMetadata, siteMetadata } from '@/lib/site-metadata'

// Inter Variable — self-hosted from rsms/inter canonical build. Single woff2
// covers all weights via the variable axis.
const inter = localFont({
  src: './fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
})

// Source Serif 4 Medium — wordmark only. next/font/google self-hosts at build
// time (no runtime requests to Google).
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: '500',
  variable: '--font-wordmark',
  display: 'swap',
})

// JetBrains Mono — numerics. Regular for inline, Medium for emphasis.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

// Layout-level default: applies to every page until a page exports its own
// metadata via pageMetadata({ title, path }). The OG/Twitter image is picked up
// by file convention from app/opengraph-image.tsx.
export const metadata = pageMetadata()

// Site-wide Organization schema. Chosen over WebSite (too thin) and
// LocalBusiness (implies a premises customers visit). Per-page schemas
// (SportsEvent, Article) extend this pattern in their own pitches.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteMetadata.name,
  url: siteMetadata.baseUrl,
  logo: `${siteMetadata.baseUrl}/opengraph-image`,
  description: siteMetadata.defaultDescription,
  founder: { '@type': 'Person', name: 'Luk Vandenbroucke' },
  foundingLocation: {
    '@type': 'Place',
    address: { '@type': 'PostalAddress', addressLocality: 'Mechelen', addressCountry: 'BE' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nl"
      className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <JsonLd data={organizationSchema} />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
