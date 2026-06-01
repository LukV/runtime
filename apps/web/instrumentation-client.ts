// Sentry — browser runtime. Next 15.3+ runs this file in place of the old
// sentry.client.config.ts. Errors only; inert unless production + DSN. No
// ad-blocker tunnel for now (low-traffic pilot — revisit if browser error
// events go missing).
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
})

// Surfaces client-side navigation errors (App Router transitions) to Sentry.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
