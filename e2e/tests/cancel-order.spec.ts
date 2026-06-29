import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

const PENDING_ORDER = {
  id: 'order-1',
  orderNumber: 'ORD-CANCEL-001',
  customerName: 'Jane Doe',
  customerEmail: 'jane@test.com',
  totalPrice: 29.99,
  status: 'PENDING',
  paymentMethod: 'COD',
  items: [{ id: 'item-1', orderId: 'order-1', productId: '1', quantity: 1, unitPrice: 29.99 }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function setupOrderMocks(page: import('@playwright/test').Page) {
  let orderStatus = 'PENDING';

  return page.route('**/api/orders**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if ((url.includes('/orders/my') || url.includes('/orders/me')) && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ ...PENDING_ORDER, status: orderStatus }],
          total: 1,
        }),
      });
      return;
    }

    if (url.includes('/orders/order-1') && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      orderStatus = 'CANCELLED';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...PENDING_ORDER, status: 'CANCELLED' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], total: 0 }),
    });
  });
}

test.describe('Cancel Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await setupOrderMocks(page);

    await page.goto('/dashboard/my-orders');
    await expect(page.getByText('ORD-CANCEL-001')).toBeVisible();
  });

  test('should show cancel button for pending orders', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Cancel order' })).toBeVisible();
  });

  test('should open confirm dialog and cancel order', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel order' }).click({ force: true });
    await expect(page.getByRole('heading', { name: 'Cancel order?' })).toBeVisible();
    await expect(page.getByText('This order will be cancelled')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel Order' }).click({ force: true });
    await expect(page.getByRole('cell', { name: 'CANCELLED' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel order' })).not.toBeVisible();
  });

  test('should dismiss confirm dialog without cancelling', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel order' }).click({ force: true });
    await expect(page.getByRole('heading', { name: 'Cancel order?' })).toBeVisible();

    await page.getByRole('dialog').locator('.MuiDialogActions-root button').first().click();
    await expect(page.getByRole('heading', { name: 'Cancel order?' })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'PENDING' })).toBeVisible();
  });
});
