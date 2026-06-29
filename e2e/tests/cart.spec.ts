import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

test.describe('Cart - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page);
    await page.goto('/dashboard/cart');
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible({ timeout: 10000 });
  });

  test('should render cart page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
  });

  test('should show browse products when cart is empty', async ({ page }) => {
    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await expect(page.getByRole('main').getByRole('button', { name: 'Browse Products' }).first()).toBeVisible();
  });
});

test.describe('Cart - API Integration (mocked)', () => {
  test('should display cart columns when cart has items', async ({ page }) => {
    await loginWithToken(page);

    await page.route('**/api/cart**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          userId: 'user-1',
          items: JSON.stringify([{ productId: '1', quantity: 2 }]),
        }),
      });
    });

    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: '1', sku: 'SKU-001', name: 'Product A', price: 19.99, stockQuantity: 50, description: 'Test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ], total: 1 }),
      });
    });

    await page.goto('/dashboard/cart');
    await expect(page.getByText('Product A')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('columnheader', { name: 'Product' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Quantity' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should open checkout dialog when checkout button clicked', async ({ page }) => {
    await loginWithToken(page);

    await page.route('**/api/cart**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          userId: 'user-1',
          items: JSON.stringify([{ productId: '1', quantity: 1 }]),
        }),
      });
    });

    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: '1', sku: 'SKU-001', name: 'Product A', price: 19.99, stockQuantity: 50 },
        ], total: 1 }),
      });
    });

    await page.goto('/dashboard/cart');
    await expect(page.getByText('Product A')).toBeVisible({ timeout: 10000 });

    const checkoutBtn = page.getByRole('button', { name: 'Checkout' });
    await expect(checkoutBtn).toBeEnabled();
    await checkoutBtn.click();
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
    await expect(page.getByLabel('Customer Name')).toBeVisible();
    await expect(page.getByLabel('Customer Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Place Order' })).toBeVisible();
  });
});
