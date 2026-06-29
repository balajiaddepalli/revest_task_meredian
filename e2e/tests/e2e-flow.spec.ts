import { test, expect } from '@playwright/test';
import { loginWithToken, openMobileNav, clickSidebar } from './helpers';

test.describe('Customer E2E Flow', () => {
  test('should complete a full customer dashboard workflow', async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();

    await openMobileNav(page);
    await clickSidebar(page, 'My Orders');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/dashboard/my-orders');

    await openMobileNav(page);
    await clickSidebar(page, 'Cart');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/dashboard/cart');

    await openMobileNav(page);
    await clickSidebar(page, 'Profile');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/dashboard/profile');
  });

  test('should maintain authentication across customer dashboard pages', async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');

    await page.goto('/dashboard/my-orders');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();

    await page.goto('/dashboard/cart');
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible({ timeout: 10000 });

    await page.goto('/dashboard/profile');
    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible();
  });
});
