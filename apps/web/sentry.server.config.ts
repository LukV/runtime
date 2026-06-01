// Sentry — Node server runtime. Errors only: no performance tracing, no
// profiling, no session replay (block 2 slot scope). The init is inert unless
// running in production with a DSN configured, so local dev and any deploy
// without the env var set stay completely silent.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
})
