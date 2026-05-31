import Link from 'next/link'
import { Wordmark } from './Wordmark'

// Per 004 §1 / §4 — wordmark left, four right-side items. Permanent Inkt
// background; the originally-pitched scroll-fade is deferred until the
// calendar's hero exists and the wordmark-on-hero contrast can be chosen
// against a known background (see nav-footer-shared-components pitch risks).
//
// "Download de app" is a mailto: as a poor-man's waitlist until the pilot
// intake pitch wires a real /pilot route.
const NAV_ITEMS = [
  { label: 'Kalender', href: '/' },
  { label: 'Hoe het werkt', href: '/hoe-het-werkt' },
  { label: 'Over ons', href: '/over-ons' },
] as const

const PILOT_MAILTO = 'mailto:luk@runtime.training?subject=Pilot'

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
              <a href={PILOT_MAILTO} className="site-header__cta">
                Download de app
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
