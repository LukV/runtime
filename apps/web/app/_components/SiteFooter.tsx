import Link from 'next/link'
import { Wordmark } from './Wordmark'

// Per 004 §1: serif lives only in the wordmark. Brand line ships in Inter
// italic (rule-conforming). Secondary links land here with the static-pages
// pitch (block 2 slot 7).
const FOOTER_LINKS = [
  { label: 'Hoe het werkt', href: '/hoe-het-werkt' },
  { label: 'Over ons', href: '/over-ons' },
  { label: 'Meebouwen', href: '/meebouwen' },
  { label: 'Privacy', href: '/privacy' },
] as const

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <Wordmark size="inline" theme="light" />
        <p className="site-footer__brand-line">Het werk is het feest.</p>
        <nav aria-label="Footernavigatie">
          <ul className="site-footer__links">
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="site-footer__bottom">
        <p>Gemaakt in Mechelen · Server in Parijs</p>
        <p>© {year} runtime.training · v0.2 pre-launch</p>
      </div>
    </footer>
  )
}
