import { defineConfig, devices } from '@playwright/test';

// Keep web + API on the same hostname. localhost vs 127.0.0.1 is cross-site
// for cookies (SameSite=Lax), so auth e2e fails if they diverge.
const webBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const apiBaseUrl = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: webBaseUrl,
    locale: 'ru-RU',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: 'npm run dev -w @nechto/api',
          url: `${apiBaseUrl}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            PORT: '3001',
            DATABASE_URL:
              process.env.DATABASE_URL ??
              'postgresql://nechto:nechto@localhost:5432/nechto',
            JWT_SECRET: process.env.JWT_SECRET ?? 'local-dev-jwt-secret-key',
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
            COOKIE_SECURE: process.env.COOKIE_SECURE ?? 'false',
            CORS_ORIGIN:
              process.env.CORS_ORIGIN ??
              'http://localhost:3000,http://127.0.0.1:3000',
            STORAGE_DRIVER: process.env.STORAGE_DRIVER ?? 'local',
            STORAGE_LOCAL_ROOT: process.env.STORAGE_LOCAL_ROOT ?? 'uploads-e2e',
            STORAGE_PUBLIC_BASE_URL:
              process.env.STORAGE_PUBLIC_BASE_URL ?? `${apiBaseUrl}/uploads`,
          },
        },
        {
          command: 'npm run dev -w @nechto/web',
          url: webBaseUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            // Always match apiBaseUrl — do not inherit a mismatched shell .env.
            NEXT_PUBLIC_API_URL: apiBaseUrl,
          },
        },
      ],
});
