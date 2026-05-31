import { test, expect } from '@playwright/test'

// Single smoke assertion: the page loads with HTTP 200 and the wordmark
// renders. Belt-and-suspenders to Vercel's own build check — catches the
// narrow case where compile succeeds but render fails (a runtime error in
// a server component, a missing env var, etc).
test('smoke: site loads and wordmark renders', async ({ page, baseURL }) => {
  const response = await page.goto('/')
  expect(response?.status(), `expected 200 from ${baseURL}`).toBe(200)
  await expect(page.getByRole('img', { name: 'runtime' }).first()).toBeVisible()
})
