const { test, expect } = require("@playwright/test");

test("dashboard page loads and main sections render", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/Apatheia Political Rhetoric Observatory/);
  await expect(page.locator("h1").first()).toContainText("Apatheia");
  await expect(page.locator("#main-content")).toBeVisible();

  const tabButtons = page.locator("[data-tab-target]");
  const count = await tabButtons.count();
  if (count > 0) {
    await tabButtons.first().click();
  }

  await expect(page.locator("section").first()).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
