import { defineConfig } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: { baseURL: BASE, browserName: "chromium" },
  projects: [
    { name: "movil-360", use: { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true } },
    { name: "tableta-768", use: { viewport: { width: 768, height: 1024 } } },
    { name: "escritorio-1024", use: { viewport: { width: 1024, height: 768 } } },
  ],
  // Contra producción (E2E_BASE_URL) no se levanta servidor local.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "npm run dev", url: BASE, reuseExistingServer: true, timeout: 120_000 },
});
