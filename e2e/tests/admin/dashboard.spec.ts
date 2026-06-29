import { test, expect } from '@playwright/test';
import { loginWithToken, openMobileNav } from './helpers';

test.describe('Admin Dashboard - Layout & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page);
    await page.goto('/');
    await page.waitForTimeout(1500);
  });

  test('should display admin dashboard with stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should have sidebar with admin navigation items', async ({ page }) => {
    await openMobileNav(page);
    await expect(page.getByRole('button', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Products', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Orders', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Users', exact: true })).toBeVisible();
  });

  test('should navigate to Products via sidebar', async ({ page }) => {
    await openMobileNav(page);
    await page.getByRole('button', { name: 'Products' }).click();
    await expect(page).toHaveURL('/products');
  });

  test('should navigate to Orders via sidebar', async ({ page }) => {
    await openMobileNav(page);
    await page.getByRole('button', { name: 'Orders', exact: true }).click();
    await expect(page).toHaveURL('/orders');
  });

  test('should navigate to Users via sidebar', async ({ page }) => {
    await openMobileNav(page);
    await page.getByRole('button', { name: 'Users' }).click();
    await expect(page).toHaveURL('/users');
  });
});
