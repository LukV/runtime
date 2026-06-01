'use client'

// Root error boundary — the only place that catches errors thrown in the root
// layout itself. Reports to Sentry, then renders a minimal Dutch fallback (it
// replaces the whole document, so it carries its own <html>/<body> and can't
// rely on the normal chrome or fonts).
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="nl">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: '2rem',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          color: '#0D1014',
          background: '#F6F5F1',
          textAlign: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Er ging iets mis.</h1>
          <p style={{ margin: 0, color: '#3A4A52' }}>
            Probeer de pagina opnieuw te laden. Blijft het misgaan, mail dan{' '}
            <a href="mailto:luk@runtime.training" style={{ color: '#0D1014' }}>
              luk@runtime.training
            </a>
            .
          </p>
        </div>
      </body>
    </html>
  )
}
