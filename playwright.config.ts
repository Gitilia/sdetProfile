import { defineConfig, devices } from "@playwright/test";

const PORT = 3173;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 8 : undefined,
  reporter: "html",
  timeout: 30_000,
  
  use: {
    baseURL: process.env.BASE_URL || `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: true,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npx serve -l ${PORT} --no-clipboard`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
      },
});
