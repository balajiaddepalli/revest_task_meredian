import { test, expect } from '@playwright/test';
import { openPublicNav } from './helpers';

test.describe('Public Products Page', () => {
  test('should display the public products page with title', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(1500);

    await expect(page.getByText('Shop All Products')).toBeVisible();
    await expect(page.getByRole('banner').getByText('MERIDIAN')).toBeVisible();
  });

  test('should have search input and category filter for products', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(1000);

    await expect(page.getByLabel('Search products')).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();
  });

  test('should navigate to home page from products page', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('banner').getByText('MERIDIAN').click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to login page from products page', async ({ page }) => {
    await page.goto('/products');
    await openPublicNav(page);
    const signInBtn = page.getByRole('button', { name: 'Sign In' });
    if (await signInBtn.count() > 0) {
      await signInBtn.first().click();
    } else {
      await page.getByText('Sign In').click();
    }
    await expect(page).toHaveURL('/login');
  });
});
