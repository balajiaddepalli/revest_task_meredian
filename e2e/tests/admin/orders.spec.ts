import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

test.describe('Admin Orders - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page);
    await page.route('**/api/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ id: '1', orderNumber: 'ORD-001', customerName: 'Alice', customerEmail: 'alice@test.com', totalPrice: 29.99, status: 'PENDING', paymentMethod: 'COD', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }], total: 1 }),
      });
    });
    await page.route('**/api/admin/products**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
    });
    await page.goto('/orders');
    await page.waitForTimeout(1500);
  });

  test('should render orders page with title and create button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Order' })).toBeVisible();
  });

  test('should display orders table with correct columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Order #' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });
});

test.describe('Admin Orders - Create Order Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page);
    await page.route('**/api/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0 }),
      });
    });
    await page.route('**/api/admin/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ id: 'p1', sku: 'SKU-1', name: 'Product', price: 10, stockQuantity: 5 }], total: 1 }),
      });
    });
    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({ timeout: 10000 });
  });

  test('should open Create Order dialog with form fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Order' }).click();

    await expect(page.getByRole('heading', { name: 'Create Order' })).toBeVisible();
    await expect(page.getByLabel('Customer Name')).toBeVisible();
    await expect(page.getByLabel('Customer Email')).toBeVisible();
    await expect(page.getByLabel('Quantity')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should close dialog on Cancel', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Order' }).click();
    await expect(page.getByRole('heading', { name: 'Create Order' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Create Order' })).not.toBeVisible();
  });

  test('should allow filling order creation form', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Order' }).click();

    await page.getByLabel('Customer Name').fill('Alice Smith');
    await page.getByLabel('Customer Email').fill('alice@example.com');
    await page.getByLabel('Quantity').fill('2');

    await expect(page.getByLabel('Customer Name')).toHaveValue('Alice Smith');
    await expect(page.getByLabel('Customer Email')).toHaveValue('alice@example.com');
    await expect(page.getByLabel('Quantity')).toHaveValue('2');
  });
});

test.describe('Admin Orders - API Integration (mocked)', () => {
  test('should display orders when API returns data', async ({ page }) => {
    await loginWithToken(page);

    await page.route('**/api/admin/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: 'prod-1', sku: 'SKU-001', name: 'Product A', price: 29.99, stockQuantity: 50, description: 'Test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ], total: 1 }),
      });
    });

    await page.route('**/api/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: '1', orderNumber: 'ORD-001', customerName: 'Alice', customerEmail: 'alice@test.com', totalPrice: 29.99, status: 'PENDING', paymentMethod: 'COD', items: [{ id: 'item-1', orderId: '1', productId: 'prod-1', quantity: 2, unitPrice: 14.995 }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ], total: 1 }),
      });
    });

    await page.goto('/orders');
    await page.waitForTimeout(1000);

    await expect(page.getByText('ORD-001')).toBeVisible();
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('$29.99')).toBeVisible();
  });
});
