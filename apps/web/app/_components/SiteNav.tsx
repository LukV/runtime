'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { PlausibleEvents, trackEvent } from '@/lib/plausible'

// Interactive half of the header: active-page indication (which page am I on?)
// via aria-current, and a hamburger toggle once the nav grew past what fits on
// a phone. Kept as a small client island so SiteHeader stays a server component.
const NAV_ITEMS = [
  { label: 'Kalender', href: '/' },
  { label: 'Hoe het werkt', href: '/hoe-het-werkt' },
  { label: 'Over ons', href: '/over-ons' },
  { label: 'Meebouwen', href: '/meebouwen' },
] as const

const PILOT_MAILTO = 'mailto:luk@runtime.training?subject=Pilot'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav aria-label="Hoofdnavigatie" className="site-header__nav-wrap">
      <button
        type="button"
        className="site-header__toggle"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? 'Menu sluiten' : 'Menu openen'}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          {open ? (
            <>
              <line x1="5" y1="5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.75" />
              <line x1="17" y1="5" x2="5" y2="17" stroke="currentColor" strokeWidth="1.75" />
            </>
          ) : (
            <>
              <line x1="3" y1="6.5" x2="19" y2="6.5" stroke="currentColor" strokeWidth="1.75" />
              <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.75" />
              <line x1="3" y1="15.5" x2="19" y2="15.5" stroke="currentColor" strokeWidth="1.75" />
            </>
          )}
        </svg>
      </button>

      <ul id="site-menu" className="site-header__nav" data-open={open || undefined}>
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(pathname, item.href) ? 'page' : undefined}
              onClick={close}
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <a
            href={PILOT_MAILTO}
            className="site-header__cta"
            onClick={() => {
              trackEvent(PlausibleEvents.downloadApp)
              close()
            }}
          >
            Download de app
          </a>
        </li>
      </ul>
    </nav>
  )
}
