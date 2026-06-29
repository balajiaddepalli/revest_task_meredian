import { test, expect } from '@playwright/test';
import { loginWithToken, mockPublicProducts, mockCartWithItems, openPublicNav, openMobileNav } from './helpers';

test.describe('Accessibility - Public Pages', () => {
  test('header navigation is accessible on public pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner').getByText('MERIDIAN')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Shop' }).or(page.getByText('Shop')).first()).toBeVisible();
  });

  test('login form fields are labeled', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.locator('form').getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('register form fields are labeled', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Gender' })).toBeVisible();
    await expect(page.locator('form').getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('products page search and category filter are labeled', async ({ page }) => {
    await mockPublicProducts(page);
    await page.goto('/products');
    await expect(page.getByLabel('Search products')).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();
  });

  test('product detail quantity controls have aria labels', async ({ page }) => {
    await mockPublicProducts(page);
    await page.goto('/products/prod-1');
    await expect(page.getByRole('button', { name: 'Increase quantity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decrease quantity' })).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});

test.describe('Accessibility - Authenticated Pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
  });

  test('dashboard sidebar navigation is accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await openMobileNav(page);
    await expect(page.getByRole('button', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'My Orders', exact: true })).toBeVisible();
  });

  test('profile gender select is accessible', async ({ page }) => {
    await page.route('**/api/users/user-1**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-1', email: 'test@example.com', fullName: 'Test User',
            gender: 'Male', role: 'CUSTOMER',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          }),
        });
        return;
      }
      await route.continue();
    });
    await page.goto('/dashboard/profile');
    await expect(page.getByRole('combobox', { name: 'Gender' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('cart quantity and remove controls have aria labels', async ({ page }) => {
    await mockCartWithItems(page);
    await page.goto('/dashboard/cart');
    await expect(page.getByRole('button', { name: 'Increase quantity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decrease quantity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove item' })).toBeVisible();
  });
});

test.describe('Accessibility - Headings & Landmarks', () => {
  test('homepage has primary heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Modern Commerce, Simplified.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Featured Products' })).toBeVisible();
  });

  test('404 page has actionable buttons', async ({ page }) => {
    await page.goto('/missing-page');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go Home' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Products' })).toBeVisible();
  });

  test('authenticated public nav remains keyboard accessible', async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await page.goto('/products');
    await openPublicNav(page);
    await expect(page.getByRole('button', { name: 'Shop' }).or(page.getByText('Shop')).first()).toBeVisible();
  });
});
