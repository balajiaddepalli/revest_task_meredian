import { test, expect } from '@playwright/test';
import { mockPublicProducts, mockProduct } from './helpers';

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockPublicProducts(page);
    await page.goto('/products/prod-1');
    await expect(page.getByRole('heading', { name: mockProduct.name })).toBeVisible();
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Shop' })).toBeVisible();
    await expect(page.getByText(mockProduct.name).first()).toBeVisible();
  });

  test('should navigate to shop via breadcrumb', async ({ page }) => {
    await page.getByRole('link', { name: 'Shop' }).click();
    await expect(page).toHaveURL('/products');
  });

  test('should have quantity selector with increase and decrease', async ({ page }) => {
    await expect(page.getByText('Quantity:')).toBeVisible();
    const qtyField = page.locator('input[readonly]');
    await expect(qtyField).toHaveValue('1');

    await page.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(qtyField).toHaveValue('2');

    await page.getByRole('button', { name: 'Decrease quantity' }).click();
    await expect(qtyField).toHaveValue('1');
  });

  test('should disable decrease at quantity 1', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });

  test('should show not found message for missing product', async ({ page }) => {
    await page.route('**/api/products/missing-id', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ statusCode: 404, message: 'Product with id missing-id not found' }),
      });
    });
    await page.goto('/products/missing-id');
    await expect(page.getByText('Product not found')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to Products' })).toBeVisible();
  });
});
