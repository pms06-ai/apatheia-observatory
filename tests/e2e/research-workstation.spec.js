const { test, expect } = require("@playwright/test");

test("actor-first workstation entry flow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /start an investigation/i })).toBeVisible();
  await page.getByLabel(/choose actor/i).selectOption({ index: 1 });

  await expect(page.getByText(/you are investigating/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /investigate/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /synthesize/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /write/i })).toBeVisible();
});

test("selecting an actor sets a canonical investigation subject", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");

  await expect(page.getByText(/you are investigating hakeem jeffries/i)).toBeVisible();

  await page.getByRole("button", { name: /reset filters/i }).click();
  await expect(page.getByText(/you are investigating hakeem jeffries/i)).toBeVisible();

  await page.getByRole("button", { name: /clear investigation/i }).click();
  await expect(page.getByRole("heading", { name: /start an investigation/i })).toBeVisible();
});

test("pinned evidence survives reload", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");
  await page.locator('.app-tab[data-tab="evidence"]').click();
  await page.locator("[data-evidence-id]").first().click();
  await page.getByRole("button", { name: /pin evidence/i }).click();

  await page.reload();
  await page.locator('.app-tab[data-tab="synthesize"]').click();
  await expect(page.getByText(/1 pinned evidence/i)).toBeVisible();
});

test("researcher can create a finding from pinned records", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");

  await page.locator('.app-tab[data-tab="evidence"]').click();
  await page.locator("[data-evidence-id]").first().click();
  await page.getByRole("button", { name: /pin evidence/i }).click();

  await page.locator('.app-tab[data-tab="synthesize"]').click();
  await page.getByRole("button", { name: /new finding/i }).click();
  await page.getByRole("textbox", { name: /finding title/i }).fill("Jeffries procedural opposition finding");
  await page.getByRole("textbox", { name: /^thesis$/i }).fill("Jeffries shifts toward procedural and evidentiary opposition.");
  await page.getByRole("button", { name: /save finding/i }).click();

  await expect(page.getByText(/jeffries procedural opposition finding/i)).toBeVisible();
});

test("researcher can insert a finding into the draft and export markdown", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/choose actor/i).selectOption("hakeem-jeffries");

  await page.locator('.app-tab[data-tab="synthesize"]').click();
  await page.getByRole("button", { name: /new finding/i }).click();
  await page.getByRole("textbox", { name: /finding title/i }).fill("Jeffries procedural opposition finding");
  await page.getByRole("textbox", { name: /^thesis$/i }).fill("Jeffries shifts toward procedural and evidentiary opposition.");
  await page.getByRole("button", { name: /save finding/i }).click();

  await page.locator('.app-tab[data-tab="write"]').click();
  await page.getByRole("button", { name: /insert finding/i }).click();

  await expect(page.locator("#draft-body")).toHaveValue(/jeffries procedural opposition finding/i);
  await expect(page.getByRole("button", { name: /export markdown/i })).toBeVisible();
});
