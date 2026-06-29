import { test, expect } from '@playwright/test';
import { loginWithToken, openPublicNav, openMobileNav, clickSidebar } from './helpers';

test.describe('Public Navigation - Guest', () => {
  test('should navigate Shop → Products from any public page', async ({ page }) => {
    for (const start of ['/', '/login', '/register']) {
      await page.goto(start);
      await openPublicNav(page);
      await page.getByRole('button', { name: 'Shop' }).first().click();
      await expect(page).toHaveURL('/products');
    }
  });

  test('should cross-link between login and register pages', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /Create one|Register/i }).click();
    await expect(page).toHaveURL('/register');

    await page.getByRole('main').getByRole('link', { name: /Sign In/i }).click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Public Navigation - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
  });

  test('should show authenticated nav links on public pages', async ({ page }) => {
    await page.goto('/products');
    await openPublicNav(page);
    await expect(page.getByRole('button', { name: 'Shop' }).or(page.getByText('Shop')).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cart' }).or(page.getByText('Cart')).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'My Orders' }).or(page.getByText('My Orders')).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Account' }).or(page.getByText('Account')).first()).toBeVisible();
  });

  test('should navigate to cart from public header', async ({ page }) => {
    await page.goto('/products');
    await openPublicNav(page);
    const cartBtn = page.getByRole('button', { name: 'Cart' });
    if (await cartBtn.count() > 0) {
      await cartBtn.first().click();
    } else {
      await page.getByText('Cart').click();
    }
    await expect(page).toHaveURL('/dashboard/cart');
  });

  test('should navigate to account from public header', async ({ page }) => {
    await page.goto('/products');
    await openPublicNav(page);
    const accountBtn = page.getByRole('button', { name: 'Account' });
    if (await accountBtn.count() > 0) {
      await accountBtn.first().click();
    } else {
      await page.getByText('Account').click();
    }
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await page.goto('/dashboard');
  });

  test('should navigate to shop from dashboard header', async ({ page }) => {
    const shopHeader = page.getByRole('banner').getByRole('button', { name: 'Shop' });
    if (await shopHeader.isVisible()) {
      await shopHeader.click();
    } else {
      await openMobileNav(page);
      await page.locator('.MuiDrawer-paper').getByRole('button', { name: 'Browse Products' }).click();
    }
    await expect(page).toHaveURL('/products');
  });

  test('should navigate all sidebar items on mobile', async ({ page }) => {
    const routes: [string, string][] = [
      ['My Orders', '/dashboard/my-orders'],
      ['Cart', '/dashboard/cart'],
      ['Profile', '/dashboard/profile'],
      ['Overview', '/dashboard'],
    ];

    for (const [label, url] of routes) {
      await openMobileNav(page);
      await clickSidebar(page, label);
      await expect(page).toHaveURL(url);
    }
  });
});

test.describe('404 Navigation', () => {
  test('should navigate to products from 404 page', async ({ page }) => {
    await page.goto('/nonexistent-route');
    await page.getByRole('button', { name: 'Browse Products' }).click();
    await expect(page).toHaveURL('/products');
  });
});
