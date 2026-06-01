'use client'

// TEMPORARY — Sentry verification page. Throws a client error on click so a
// test event can be confirmed in the Sentry dashboard. Disallowed in robots.ts
// and linked from nowhere. Remove this folder (and the robots disallow) once
// the pipeline is verified.
import * as Sentry from '@sentry/nextjs'

export default function SentryExamplePage() {
  return (
    <main style={{ padding: '3rem', maxWidth: '32rem', margin: '0 auto' }}>
      <h1>Sentry test</h1>
      <p>Klik om een test-fout naar Sentry te sturen, dan weer weghalen.</p>
      <button
        type="button"
        onClick={() => {
          Sentry.captureException(new Error('Sentry handled test (button)'))
          throw new Error('Sentry uncaught test (button)')
        }}
        style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        Throw test error
      </button>
    </main>
  )
}
