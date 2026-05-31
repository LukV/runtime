import { Wordmark } from './Wordmark'

// Per 004 §1: serif lives only in the wordmark. Brand line ships in Inter
// italic (rule-conforming). Secondary-links section is intentionally empty
// today — Privacy + other links land in the static-pages pitch (block 2
// slot 6).
export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <Wordmark size="inline" theme="light" />
        <p className="site-footer__brand-line">Het werk is het feest.</p>
      </div>
      <div className="site-footer__bottom">
        <p>Gemaakt in Mechelen · Server in Parijs</p>
        <p>© {year} runtime.training · v0.2 pre-launch</p>
      </div>
    </footer>
  )
}
