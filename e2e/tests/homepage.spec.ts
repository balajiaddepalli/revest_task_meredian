import { test, expect } from '@playwright/test';
import { mockFeaturedProducts, mockProduct, openPublicNav } from './helpers';

test.describe('Homepage - Landing & Hero', () => {
  test('should display hero section with headline and CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Home \| Meridian/);
    await expect(page.getByRole('heading', { name: 'Modern Commerce, Simplified.' })).toBeVisible();
    await expect(page.getByText('Discover a curated collection of premium products')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Products' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('should navigate to shop via Browse Products CTA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Browse Products' }).click();
    await expect(page).toHaveURL('/products');
  });

  test('should navigate to register via Create Account CTA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/register');
  });

  test('should display value proposition features', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Curated Collection', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fast Shipping', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Secure Checkout', exact: true })).toBeVisible();
    await expect(page.getByText('Free delivery on orders over $50')).toBeVisible();
  });

  test('should display footer with copyright', async ({ page }) => {
    await page.goto('/');
    const year = new Date().getFullYear().toString();
    await expect(page.getByText(new RegExp(`${year} Meridian`))).toBeVisible();
  });
});

test.describe('Homepage - Featured Products', () => {
  test.beforeEach(async ({ page }) => {
    await mockFeaturedProducts(page);
    await page.goto('/');
  });

  test('should display featured products section with cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Featured Products' })).toBeVisible();
    await expect(page.getByText('Handpicked just for you')).toBeVisible();
    await expect(page.getByText(mockProduct.name)).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Details' }).first()).toBeVisible();
  });

  test('should navigate to product detail from featured card', async ({ page }) => {
    await page.getByRole('button', { name: 'View Details' }).first().click();
    await expect(page).toHaveURL(`/products/${mockProduct.id}`);
  });

  test('should navigate to shop via View All Products', async ({ page }) => {
    await page.getByRole('button', { name: 'View All Products' }).click();
    await expect(page).toHaveURL('/products');
  });
});

test.describe('Homepage - Navigation Chrome', () => {
  test('should show guest nav links in header', async ({ page }) => {
    await page.goto('/');
    await openPublicNav(page);
    await expect(page.getByRole('button', { name: 'Shop' }).or(page.getByText('Shop')).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' }).or(page.getByText('Sign In')).first()).toBeVisible();
  });

  test('should navigate home when clicking MERIDIAN brand', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('banner').getByText('MERIDIAN').click();
    await expect(page).toHaveURL('/');
  });
});
