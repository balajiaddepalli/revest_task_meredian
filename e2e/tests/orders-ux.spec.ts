import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

const ORDER = {
  id: 'order-1',
  orderNumber: 'ORD-DETAIL-001',
  customerName: 'Jane Doe',
  customerEmail: 'jane@test.com',
  totalPrice: 59.98,
  status: 'PENDING',
  paymentMethod: 'COD',
  items: [
    { id: 'item-1', orderId: 'order-1', productId: 'prod-1', quantity: 2, unitPrice: 29.99 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

test.describe('Orders UX', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await page.route('**/api/orders**', async (route) => {
      if (route.request().url().includes('/orders/my') || route.request().url().includes('/orders/me')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [ORDER], total: 1 }),
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
    });
    await page.goto('/dashboard/my-orders');
    await expect(page.getByText('ORD-DETAIL-001')).toBeVisible();
  });

  test('should display orders table with status and payment columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Order #' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Payment' })).toBeVisible();
    await expect(page.getByText('PENDING')).toBeVisible();
    await expect(page.getByText('COD')).toBeVisible();
  });

  test('should open order details dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'View order details' }).click();
    const dialog = page.getByRole('dialog', { name: 'Order Details' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('ORD-DETAIL-001')).toBeVisible();
    await expect(dialog.getByText('PENDING')).toBeVisible();
    await expect(dialog.getByText('COD')).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('should show empty state when no orders', async ({ page }) => {
    await page.route('**/api/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0 }),
      });
    });
    await page.goto('/dashboard/my-orders');
    await expect(page.getByText('No orders yet')).toBeVisible();
  });
});
