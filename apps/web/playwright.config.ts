import { defineConfig, devices } from '@playwright/test'

// Minimal Playwright config: single Chromium project, no screenshots/videos
// by default. Base URL comes from PREVIEW_URL at runtime — the smoke runs
// against a Vercel preview deploy in CI, or against any URL locally.
//
// Defaults to https://www.runtime.training when PREVIEW_URL isn't set, so
// `npm run test:smoke` from a clean shell hits production.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PREVIEW_URL ?? 'https://www.runtime.training',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
