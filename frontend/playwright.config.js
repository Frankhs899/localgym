import { defineConfig, devices } from '@playwright/test'

// The design-contract probes (R3-001, L41) measure *compiled* CSS, so they run in
// a real browser against the real `vite build` output. jsdom cannot stand in:
// it has no layout (the 36 px `min-height` would measure 0), no `:focus-visible`
// cascade (the accent ring is an arbitrary-variant utility on the screen root) and
// no Tailwind `@theme`/`@layer` output. `channel: 'chrome'` reuses the system
// Chrome this workstation and GitHub's `ubuntu-latest` runner already ship, so the
// suite never needs `playwright install` to download a browser first.
const PORT = 4173
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'off',
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  // Preview the build the user actually gets: `pnpm test` runs `vite build` first
  // (package.json), so the assertions can never pass against stale CSS.
  webServer: {
    // `--host 127.0.0.1` on purpose: `vite preview` otherwise binds `[::1]`
    // only (measured), and Playwright polls `127.0.0.1`.
    command: `pnpm exec vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    // Never reuse: the suite must only ever measure the build it just compiled,
    // so a stray `vite preview` (e.g. from a verifier's scratch copy) sitting on
    // `127.0.0.1:4173` has to fail the run loudly instead of being measured.
    // Playwright's pre-flight check answers first; `--strictPort` is the second
    // line of defence, making `vite preview` itself exit non-zero on a taken port.
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
