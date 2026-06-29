import { test, expect } from '@playwright/test';
import { makeFakeJwt } from './helpers';

test.describe('Admin Auth - Access Control', () => {
  test('should reject non-admin login with "Admin access only"', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: makeFakeJwt({ sub: 'cust-1', email: 'customer@test.com', role: 'CUSTOMER' }),
          user: { id: 'cust-1', email: 'customer@test.com', fullName: 'Customer User', role: 'CUSTOMER' },
        }),
      });
    });

    await page.goto('/login');
    await expect(page.getByText('Meridian Admin Portal')).toBeVisible();

    await page.getByLabel('Email').fill('customer@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Admin access only')).toBeVisible();
    await expect(page).toHaveURL('/login');

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });

  test('should allow admin login and reach dashboard', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: makeFakeJwt({ sub: 'admin-1', email: 'admin@meridian.com', role: 'ADMIN' }),
          user: { id: 'admin-1', email: 'admin@meridian.com', fullName: 'Admin User', role: 'ADMIN' },
        }),
      });
    });
    await page.route('**/api/admin/products**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
    });
    await page.route('**/api/orders**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
    });
    await page.route('**/api/users**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@meridian.com');
    await page.getByLabel('Password').fill('admin123');
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
