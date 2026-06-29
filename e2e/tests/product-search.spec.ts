import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

test.describe('Product Search and Filter', () => {
  const allProducts = [
    { id: 'p1', sku: 'ELEC-001', name: 'Wireless Headphones', price: 249.99, stockQuantity: 10, description: 'Audio', categoryId: 'cat-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p2', sku: 'CLTH-001', name: 'Denim Jacket', price: 89.99, stockQuantity: 5, description: 'Clothing', categoryId: 'cat-2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/categories**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'cat-1', name: 'Electronics', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'cat-2', name: 'Clothing', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ]),
      });
    });

    await page.route('**/api/products**', async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search') || '';
      const categoryId = url.searchParams.get('categoryId') || '';
      let filtered = allProducts;
      if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      if (categoryId) filtered = filtered.filter((p) => p.categoryId === categoryId);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: filtered, total: filtered.length }),
      });
    });

    await page.goto('/products');
    await expect(page.getByText('Shop All Products')).toBeVisible();
  });

  test('should filter products by search text', async ({ page }) => {
    await expect(page.getByText('Wireless Headphones')).toBeVisible();
    await expect(page.getByText('Denim Jacket')).toBeVisible();

    await page.getByLabel('Search products').fill('Denim');
    await page.waitForTimeout(400);

    await expect(page.getByText('Denim Jacket')).toBeVisible();
    await expect(page.getByText('Wireless Headphones')).not.toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    await page.getByLabel('Category').click();
    await page.getByRole('option', { name: 'Electronics' }).click();
    await page.waitForTimeout(400);

    await expect(page.getByText('Wireless Headphones')).toBeVisible();
    await expect(page.getByText('Denim Jacket')).not.toBeVisible();
  });
});
