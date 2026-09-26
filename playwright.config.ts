import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: 'http://127.0.0.1:3130',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm build --webpack && pnpm start --hostname 127.0.0.1 --port 3130',
    url: 'http://127.0.0.1:3130',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'mobile-chromium', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
