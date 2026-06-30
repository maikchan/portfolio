import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: 'http://localhost:3456',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx serve . -p 3456 --no-clipboard',
    url: 'http://localhost:3456',
    reuseExistingServer: true,
    timeout: 10000,
  },
  projects: [
    {
      name: 'mobile-portrait',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'mobile-landscape',
      use: { ...devices['iPhone 13 landscape'] },
    },
    {
      name: 'tablet-portrait',
      use: { ...devices['iPad (gen 7)'] },
    },
    {
      name: 'tablet-landscape',
      use: { ...devices['iPad (gen 7) landscape'] },
    },
    {
      name: 'notebook',
      use: { viewport: { width: 1366, height: 768 }, hasTouch: false },
    },
    {
      name: 'macbook',
      use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
    },
    {
      name: 'desktop-large',
      use: { viewport: { width: 1920, height: 1080 } },
    },
  ],
});
