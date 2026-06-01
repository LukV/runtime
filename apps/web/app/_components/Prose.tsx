import type { ReactNode } from 'react'

// Shared layout primitives for the static content pages (Hoe het werkt,
// Over ons, Privacy). They own the page's vertical rhythm, measure, and type
// scale so each page composes sections instead of re-deriving spacing. Visual
// rules live in globals.css under "content pages"; these wrappers just name the
// structure. Per 004 §1: headings are Inter (serif is wordmark-only), body is
// Houtskool on Krijt, amber stays out of the chrome.

export function Page({ children }: { children: ReactNode }) {
  return <article className="page">{children}</article>
}

// The page's opening block: small uppercase eyebrow, large Inkt title, and an
// optional lede paragraph in a slightly larger body size.
export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
}) {
  return (
    <header className="page__header">
      <p className="page__eyebrow">{eyebrow}</p>
      <h1 className="page__title">{title}</h1>
      {lede ? <p className="page__lede">{lede}</p> : null}
    </header>
  )
}

// A measure-constrained column for running text — caps line length around the
// readable 60–70ch and sets the body rhythm.
export function Prose({ children }: { children: ReactNode }) {
  return <div className="prose">{children}</div>
}

// A page section with consistent top rhythm. `tone="raised"` tints the block in
// Stof to break the page into bands (used for the call-for-partners surface).
export function Section({
  children,
  tone = 'plain',
}: {
  children: ReactNode
  tone?: 'plain' | 'raised'
}) {
  return <section className={`page__section page__section--${tone}`}>{children}</section>
}
