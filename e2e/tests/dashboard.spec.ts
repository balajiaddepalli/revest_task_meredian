import { test, expect } from '@playwright/test';
import { loginWithToken, openMobileNav, clickSidebar } from './helpers';

test.describe('Customer Dashboard - Layout & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await page.goto('/dashboard');
    await page.waitForTimeout(1500);
  });

  test('should display the dashboard with welcome message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
  });

  test('should have sidebar with customer navigation items', async ({ page }) => {
    await openMobileNav(page);
    await expect(page.getByRole('button', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'My Orders', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cart', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Profile', exact: true })).toBeVisible();
  });

  test('should have Logout button in the header', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('should navigate to My Orders via sidebar', async ({ page }) => {
    await openMobileNav(page);
    await clickSidebar(page, 'My Orders');
    await expect(page).toHaveURL('/dashboard/my-orders');
  });

  test('should navigate to Cart page via sidebar', async ({ page }) => {
    await openMobileNav(page);
    await clickSidebar(page, 'Cart');
    await expect(page).toHaveURL('/dashboard/cart');
  });

  test('should navigate to Profile via sidebar', async ({ page }) => {
    await openMobileNav(page);
    await clickSidebar(page, 'Profile');
    await expect(page).toHaveURL('/dashboard/profile');
  });

  test('should navigate back to Overview via sidebar', async ({ page }) => {
    await openMobileNav(page);
    await clickSidebar(page, 'Cart');
    await page.waitForTimeout(500);
    await openMobileNav(page);
    await clickSidebar(page, 'Overview');
    await expect(page).toHaveURL('/dashboard');
  });
});
