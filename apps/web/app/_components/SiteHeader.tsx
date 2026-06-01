import Link from 'next/link'
import { Wordmark } from './Wordmark'
import { SiteNav } from './SiteNav'

// Per 004 §1 / §4 — wordmark left, nav right, transparent on the body's Krijt
// ground with just a thin divider beneath. The amber (Eerste licht) is reserved
// for accent dots — wordmark period and ribbon dot — never for chrome buttons
// (004 §1: "the warmth doesn't scale"). The interactive nav (active-page state +
// mobile hamburger) lives in the SiteNav client island.
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" aria-label="runtime — naar de homepage" className="site-header__wordmark">
          <Wordmark size="header" theme="light" />
        </Link>
        <SiteNav />
      </div>
    </header>
  )
}
