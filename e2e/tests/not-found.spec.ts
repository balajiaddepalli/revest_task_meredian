import { test, expect } from '@playwright/test';

test.describe('404 Not Found Page', () => {
  test('should display 404 page with title and navigation', async ({ page }) => {
    await page.goto('/does-not-exist');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
    await expect(page).toHaveTitle(/Page Not Found/);
  });

  test('should navigate home from 404 page', async ({ page }) => {
    await page.goto('/does-not-exist');
    await page.getByRole('button', { name: 'Go Home' }).click();
    await expect(page).toHaveURL('/');
  });
});
