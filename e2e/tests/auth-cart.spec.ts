import { test, expect } from '@playwright/test';
import { loginWithToken, mockProduct } from './helpers';

test.describe('Authenticated Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');

    await page.route('**/api/products**', async (route) => {
      const url = route.request().url();
      if (route.request().method() !== 'GET') return route.continue();
      if (url.match(/\/products\/[^/?]+$/)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProduct),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [mockProduct], total: 1 }),
      });
    });

    await page.route('**/api/categories**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route('**/api/cart**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'cart-1', userId: 'user-1', items: '[]' }),
      });
    });
  });

  test('should show success toast when adding to cart from shop page', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText(mockProduct.name)).toBeVisible();
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.getByRole('alert').filter({ hasText: 'Added to cart!' })).toBeVisible();
    await page.getByRole('button', { name: 'View Cart' }).click();
    await expect(page).toHaveURL('/dashboard/cart');
  });

  test('should show success toast when adding to cart from product detail', async ({ page }) => {
    await page.goto(`/products/${mockProduct.id}`);
    await expect(page.getByRole('heading', { name: mockProduct.name })).toBeVisible();
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByRole('alert').filter({ hasText: /Added .* to cart!/ })).toBeVisible();
  });
});
