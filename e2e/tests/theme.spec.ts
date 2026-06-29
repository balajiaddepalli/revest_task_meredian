import { test, expect } from '@playwright/test';

test.describe('Site Chrome', () => {
  test('should not show theme toggle in header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Toggle dark mode' })).not.toBeVisible();
  });

  test('should show site footer on public pages', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/Meridian\. All rights reserved/)).toBeVisible();
    await expect(footer.getByRole('link', { name: 'All Products' })).toBeVisible();
  });

  test('should not show Register in header nav', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    await expect(header.getByRole('button', { name: 'Register' })).not.toBeVisible();
  });
});
