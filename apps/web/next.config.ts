import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  transpilePackages: ['@runtime/design-tokens'],
}

// Sentry build wrapper. org/project/authToken come from env at build time
// (SENTRY_AUTH_TOKEN is a Vercel build secret); when they're absent — local
// builds, un-configured deploys — source-map upload is skipped with a warning
// and the build continues. Errors only: no Vercel cron monitors, logger
// tree-shaken out of the client bundle.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  automaticVercelMonitors: false,
  disableLogger: true,
})
