import { test, expect } from '@playwright/test';
import { loginWithToken, openMobileNav, clickSidebar } from './helpers';

test.describe('Customer Orders', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
  });

  test('should navigate between cart and my orders via sidebar', async ({ page }) => {
    await page.goto('/dashboard/cart');
    await page.waitForTimeout(1000);
    await openMobileNav(page);
    await clickSidebar(page, 'My Orders');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/dashboard/my-orders');
  });

  test('should display order data in my orders table when available', async ({ page }) => {
    const now = new Date().toISOString();

    await page.route('**/api/orders/my**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customerName: 'Alice',
            customerEmail: 'alice@test.com',
            totalPrice: 59.98,
            status: 'PENDING',
            paymentMethod: 'COD',
            items: [{ id: 'item-1', orderId: '1', productId: '1', quantity: 2, unitPrice: 29.99 }],
            createdAt: now,
            updatedAt: now,
          },
        ], total: 1 }),
      });
    });

    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: '1', sku: 'SKU-001', name: 'Product A', price: 29.99, stockQuantity: 50 },
        ], total: 1 }),
      });
    });

    await page.goto('/dashboard/my-orders');
    await page.waitForTimeout(1000);

    await expect(page.getByText('ORD-001')).toBeVisible();
    await expect(page.getByText('$59.98')).toBeVisible();
  });
});
