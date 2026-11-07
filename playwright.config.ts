import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://127.0.0.1:8080",
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: "node scripts/serve.cjs",
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
  reporter: "list",
});
