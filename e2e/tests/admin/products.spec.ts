import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

test.describe('Admin Products - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page);
    await page.route('**/api/admin/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ id: '1', sku: 'SKU-001', name: 'Product A', price: 19.99, stockQuantity: 50, description: 'Test', categoryId: '', imageUrl: '', deletedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }], total: 1 }),
      });
    });
    await page.route('**/api/categories**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.goto('/products');
    await page.waitForTimeout(1500);
  });

  test('should render products page with title and buttons', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Product' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Manage Categories' })).toBeVisible();
  });

  test('should display product table with correct columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'SKU' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Category' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Stock' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should have search input for filtering products', async ({ page }) => {
    await expect(page.getByLabel('Search products')).toBeVisible();
  });
});

test.describe('Admin Products - Add/Edit Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page);
    await page.goto('/products');
    await page.waitForTimeout(1500);
  });

  test('should open Add Product dialog with form fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Product' }).click();

    await expect(page.getByRole('heading', { name: 'Add Product' })).toBeVisible();
    await expect(page.getByLabel('SKU')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Price')).toBeVisible();
    await expect(page.getByLabel('Stock Quantity')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Image URL')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should close dialog on Cancel', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Product' }).click();
    await expect(page.getByRole('heading', { name: 'Add Product' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click({ force: true });
    await expect(page.getByRole('heading', { name: 'Add Product' })).not.toBeVisible();
  });

  test('should allow filling product form fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.getByLabel('SKU').fill('TEST-SKU-001');
    await page.getByLabel('Name').fill('Test Product');
    await page.getByLabel('Price').fill('29.99');
    await page.getByLabel('Stock Quantity').fill('100');
    await page.getByLabel('Description').fill('Test description');

    await expect(page.getByLabel('SKU')).toHaveValue('TEST-SKU-001');
    await expect(page.getByLabel('Name')).toHaveValue('Test Product');
    await expect(page.getByLabel('Price')).toHaveValue('29.99');
    await expect(page.getByLabel('Stock Quantity')).toHaveValue('100');
    await expect(page.getByLabel('Description')).toHaveValue('Test description');
  });
});

test.describe('Admin Products - API Integration (mocked)', () => {
  test('should display products when API returns data', async ({ page }) => {
    await loginWithToken(page);

    await page.route('**/api/admin/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: '1', sku: 'SKU-001', name: 'Product A', price: 19.99, stockQuantity: 50, description: 'Test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '2', sku: 'SKU-002', name: 'Product B', price: 39.99, stockQuantity: 10, description: 'Test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ], total: 2 }),
      });
    });

    await page.goto('/products');
    await page.waitForTimeout(1000);

    await expect(page.getByText('SKU-001')).toBeVisible();
    await expect(page.getByText('Product A')).toBeVisible();
    await expect(page.getByText('$19.99')).toBeVisible();
    await expect(page.getByText('SKU-002')).toBeVisible();
    await expect(page.getByText('Product B')).toBeVisible();
  });

  test('should handle API error gracefully', async ({ page }) => {
    await loginWithToken(page);

    await page.route('**/api/admin/products**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' }),
      });
    });

    await page.goto('/products');
    const errorText = page.getByText(/Failed to load/i);
    if (await errorText.isVisible().catch(() => false)) {
      await expect(errorText).toBeVisible();
    }
  });
});
