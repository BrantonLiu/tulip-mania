import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Tulip Mania/);
});

test('heading is visible', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to be visible
  const h1 = page.locator('h1');
  await expect(h1).toBeVisible();
});
