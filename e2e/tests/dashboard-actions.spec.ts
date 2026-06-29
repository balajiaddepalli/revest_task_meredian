import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

test.describe('Dashboard Quick Actions', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
  });

  test('should display all quick action cards', async ({ page }) => {
    await expect(page.getByText('Manage your orders, cart, and profile')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cart' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByText('Track and manage your orders')).toBeVisible();
    await expect(page.getByText('Review items and checkout')).toBeVisible();
    await expect(page.getByText('Update your account details')).toBeVisible();
  });

  test('should navigate to My Orders via action card', async ({ page }) => {
    await page.getByRole('heading', { name: 'My Orders' }).click();
    await expect(page).toHaveURL('/dashboard/my-orders');
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();
  });

  test('should navigate to Cart via action card', async ({ page }) => {
    await page.getByRole('heading', { name: 'Cart' }).click();
    await expect(page).toHaveURL('/dashboard/cart');
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
  });

  test('should navigate to Profile via action card', async ({ page }) => {
    await page.getByRole('heading', { name: 'Profile' }).click();
    await expect(page).toHaveURL('/dashboard/profile');
    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible();
  });
});
