import { test, expect, Page } from '@playwright/test';
import { makeFakeJwt } from './helpers';

const TEST_EMAIL = 'jane@test.com';
const TEST_PASSWORD = 'secure123';
const TEST_NAME = 'Jane Doe';
const USER_ID = 'user-jane-123';

async function mockAuth(page: Page) {
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 201, contentType: 'application/json',
      body: JSON.stringify({ id: USER_ID, email: TEST_EMAIL, fullName: TEST_NAME }),
    });
  });
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        access_token: makeFakeJwt({ sub: USER_ID, email: TEST_EMAIL, role: 'CUSTOMER' }),
        user: { id: USER_ID, email: TEST_EMAIL, fullName: TEST_NAME, role: 'CUSTOMER' },
      }),
    });
  });
}

async function mockProducts(page: Page) {
  await page.route('**/api/products**', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: [
        { id: 'prod-1', sku: 'SKU-001', name: 'Widget', description: 'A widget', price: 19.99, stockQuantity: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'prod-2', sku: 'SKU-002', name: 'Gadget', description: 'A gadget', price: 29.99, stockQuantity: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ], total: 2 }),
    });
  });
  await page.route('**/api/categories**', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([{ id: 'cat-1', name: 'Electronics', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]),
    });
  });
}

async function mockCart(page: Page) {
  await page.route('**/api/cart**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (method === 'GET') {
      const items = cartItems;
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ id: 'cart-1', userId: USER_ID, items: JSON.stringify(items), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      });
    } else if (method === 'POST' && url.includes('/checkout')) {
      cartItems.length = 0;
      await route.fulfill({
        status: 201, contentType: 'application/json',
        body: JSON.stringify({
          id: 'order-1', orderNumber: 'ORD-JOURNEY-001', totalPrice: 19.99, status: 'PENDING',
          paymentMethod: 'COD', customerName: TEST_NAME, customerEmail: TEST_EMAIL, userId: USER_ID,
          items: [{ id: 'oi-1', orderId: 'order-1', productId: 'prod-1', quantity: 1, unitPrice: 19.99 }],
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }),
      });
    } else if (method === 'POST') {
      cartItems.push({ productId: 'prod-1', quantity: 1 });
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
  });
}

const cartItems: { productId: string; quantity: number }[] = [{ productId: 'prod-1', quantity: 1 }];

test.describe('Complete User Journey', () => {
  test('full flow: register, login, browse, cart, checkout with COD, view orders', async ({ page }) => {
    cartItems.length = 0;
    cartItems.push({ productId: 'prod-1', quantity: 1 });

    await mockAuth(page);
    await mockProducts(page);
    await mockCart(page);

    await page.route('**/api/orders/my**', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: [{
          id: 'order-1', orderNumber: 'ORD-JOURNEY-001', totalPrice: 19.99, status: 'PENDING',
          paymentMethod: 'COD', customerName: TEST_NAME, customerEmail: TEST_EMAIL, userId: USER_ID,
          items: [{ id: 'oi-1', orderId: 'order-1', productId: 'prod-1', quantity: 1, unitPrice: 19.99 }],
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }], total: 1 }),
      });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('banner').getByText('MERIDIAN')).toBeVisible();

    await page.goto('/register');
    await page.waitForTimeout(1000);
    await expect(page.getByText('Registration Form')).toBeVisible();

    await page.getByLabel('Full Name').fill(TEST_NAME);
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('combobox', { name: 'Gender' }).click();
    await page.getByRole('option', { name: 'Female' }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/login');

    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(1000);

    await page.goto('/products');
    await page.waitForTimeout(1000);
    await expect(page.getByText('Shop All Products')).toBeVisible();

    await page.goto('/dashboard/my-orders');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'My Orders' })).toBeVisible();

    await page.goto('/dashboard/cart');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();

    const checkoutBtn = page.getByRole('button', { name: 'Checkout' });
    if (await checkoutBtn.isEnabled().catch(() => false)) {
      await checkoutBtn.click();
      await page.waitForTimeout(500);
      await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
      await page.getByLabel('Customer Name').fill(TEST_NAME);
      await page.getByLabel('Customer Email').fill(TEST_EMAIL);
      await page.getByRole('button', { name: 'Place Order' }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL('/dashboard/my-orders');
    }

    await expect(page.getByText('ORD-JOURNEY-001')).toBeVisible();
    await expect(page.getByText('$19.99')).toBeVisible();
    await expect(page.getByText('COD')).toBeVisible();
    await expect(page.getByText('PENDING')).toBeVisible();
  });
});
