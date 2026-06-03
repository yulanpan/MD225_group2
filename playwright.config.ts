import { defineConfig, devices } from "@playwright/test";

const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3027",
    trace: "on-first-retry",
    ...(chromiumExecutablePath ? { launchOptions: { executablePath: chromiumExecutablePath } } : {})
  },
  webServer: {
    command: "OPENAI_API_KEY= OPENAI_BASE_URL= OPENAI_MODEL= OPENAI_PROVIDER_MODE= pnpm exec next dev -p 3027",
    url: "http://localhost:3027",
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
