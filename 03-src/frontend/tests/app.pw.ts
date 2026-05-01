import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Tulip Mania/);
});

test('intro scene is readable', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Amsterdam, winter 1637')).toBeVisible();
  await expect(page.locator('.intro-text')).toBeVisible();
});

test('can enter tavern without duplicated undefined dialogue', async ({ page }) => {
  await page.goto('/');

  const enterButton = page.getByRole('button', { name: '推门进入' });
  await expect(enterButton).toBeVisible({ timeout: 15000 });
  await enterButton.click();

  await expect(page.getByText('今日行情')).toBeVisible();
  await expect(page.getByText(/欢迎来到我的酒馆/)).toBeVisible({ timeout: 4000 });

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toContain('undefined');
});

test('trade market shows tulip artwork and chalkboard pricing', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '推门进入' }).click();
  await page.getByRole('button', { name: '交易市场' }).click();

  await expect(page.getByRole('heading', { name: '交易市场' })).toBeVisible();
  await expect(page.locator('.trade-asset-image').first()).toBeVisible();

  await page.getByRole('button', { name: /Semper Augustus/ }).click();

  await expect(page.getByRole('heading', { name: 'Semper Augustus' })).toBeVisible();
  await expect(page.locator('.trade-detail-image')).toBeVisible();
  await expect(page.getByText('当前价格')).toBeVisible();
});
