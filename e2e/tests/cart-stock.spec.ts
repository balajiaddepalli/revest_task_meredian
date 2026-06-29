import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

test.describe('Cart Stock Errors', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');

    await page.route('**/api/cart**', async (route) => {
      const method = route.request().method();
      const url = route.request().url();

      if (method === 'PATCH' || (method === 'PUT' && url.includes('/prod-1'))) {
        const body = route.request().postDataJSON() as { productId?: string } | null;
        if (method === 'PATCH' && body?.productId !== 'prod-1') {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Insufficient stock' }),
        });
        return;
      }

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'cart-1',
            userId: 'user-1',
            items: JSON.stringify([{ productId: 'prod-1', quantity: 1 }]),
          }),
        });
        return;
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });

    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{
            id: 'prod-1', sku: 'SKU-001', name: 'Widget', price: 19.99, stockQuantity: 1,
            description: 'Test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          }],
          total: 1,
        }),
      });
    });

    await page.goto('/dashboard/cart');
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible({ timeout: 10000 });
  });

  test('should show error toast when increment exceeds stock', async ({ page }) => {
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Insufficient stock' })).toBeVisible();
  });
});
