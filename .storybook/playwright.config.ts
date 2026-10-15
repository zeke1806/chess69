import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../verification/storybook',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:6011', viewport: { width: 412, height: 915 } },
  webServer: {
    command: 'python3 -m http.server 6011 --bind 127.0.0.1 --directory storybook-static',
    cwd: '..',
    url: 'http://127.0.0.1:6011/index.json',
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
