import { test, expect } from '@playwright/test';
import { loginWithToken, openPublicNav } from './helpers';

test.describe('Authentication - Login Page', () => {
  test('should display the login page with all required elements', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.locator('form').getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should navigate to products page from login page chrome', async ({ page }) => {
    await page.goto('/login');
    await openPublicNav(page);
    await page.getByRole('button', { name: 'Shop' }).first().click();
    await expect(page).toHaveURL('/products');
  });

  test('should show browser validation for empty login form when submitted', async ({ page }) => {
    await page.goto('/login');
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Authentication - Auth Guard / Protected Routes', () => {
  test('should redirect customer dashboard routes to login when no token', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/my-orders',
      '/dashboard/cart',
      '/dashboard/profile',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    }
  });

  test('should redirect to login after clearing token from localStorage', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('accessToken'));
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe('Authentication - Logout', () => {
  test('should show logout button after authentication', async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('should clear token and redirect on logout', async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Logout' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/login');
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });
});

test.describe('Authentication - Token Persistence', () => {
  test('should persist token across page reloads', async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible({ timeout: 10000 });

    await page.reload();
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible({ timeout: 10000 });
  });
});
