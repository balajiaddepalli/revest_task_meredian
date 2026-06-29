import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /admin\//,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      testIgnore: /admin\//,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'admin-chromium',
      testDir: './tests/admin',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3006' },
    },
    {
      name: 'admin-mobile',
      testDir: './tests/admin',
      use: { ...devices['Pixel 5'], baseURL: 'http://localhost:3006' },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../frontend',
      port: 3005,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'npm run dev',
      cwd: '../admin-frontend',
      port: 3006,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
