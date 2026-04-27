// @ts-check
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  timeout: 5000,
  use: {
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
