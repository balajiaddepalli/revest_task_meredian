import { test, expect } from '@playwright/test';
import { mockFeaturedProducts, mockPublicProducts, mockProduct } from './helpers';

test.describe('Guest Journey - Explore & Discover', () => {
  test('homepage → shop → product detail via hero flow', async ({ page }) => {
    await mockFeaturedProducts(page);
    await mockPublicProducts(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Modern Commerce, Simplified.' })).toBeVisible();

    await page.getByRole('button', { name: 'Browse Products' }).click();
    await expect(page).toHaveURL('/products');
    await expect(page.getByText('Shop All Products')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Add to Cart' }).first().or(page.getByText('No products found')),
    ).toBeVisible({ timeout: 15000 });

    await page.getByText(mockProduct.name).click();
    await expect(page).toHaveURL(`/products/${mockProduct.id}`);
    await expect(page.getByRole('heading', { name: mockProduct.name })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  });

  test('homepage → register → login redirect flow', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

    await page.getByRole('main').getByRole('link', { name: /Sign In/i }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Welcome Back')).toBeVisible();
  });

  test('guest add-to-cart redirects to login preserving intent', async ({ page }) => {
    await mockPublicProducts(page);
    await page.goto('/products');
    await expect(
      page.getByRole('button', { name: 'Add to Cart' }).first(),
    ).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page).toHaveURL('/login');
  });

  test('product detail breadcrumb journey back to shop and home', async ({ page }) => {
    await mockPublicProducts(page);
    await page.goto(`/products/${mockProduct.id}`);
    await page.getByRole('link', { name: 'Shop' }).click();
    await expect(page).toHaveURL('/products');
    await page.getByRole('banner').getByText('MERIDIAN').click();
    await expect(page).toHaveURL('/');
  });
});
