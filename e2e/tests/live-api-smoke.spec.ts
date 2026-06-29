import { test, expect } from '@playwright/test';
import { isLiveBackendReady } from './helpers';

const API = process.env.API_URL || 'http://localhost:3000/api';

test.describe.configure({ mode: 'serial' });

test.describe('Live API Smoke (UI)', () => {
  test.beforeEach(async () => {
    if (!(await isLiveBackendReady())) {
      test.skip(
        true,
        'Live backend not ready — start services and run ./scripts/setup-backend.sh',
      );
    }
  });

  test('register and login via UI against live backend', async ({ page }) => {
    const email = `e2e-live-${Date.now()}@test.com`;
    const password = 'SecurePass123';

    await page.goto('/register');
    await expect(page.getByText('Registration Form')).toBeVisible({ timeout: 15000 });

    await page.getByLabel('Full Name').fill('Live E2E User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('combobox', { name: 'Gender' }).click();
    await page.getByRole('option', { name: 'Male', exact: true }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL('/login', { timeout: 15000 });

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();

    await page.goto('/products');
    await expect(page.getByText('Shop All Products')).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('button', { name: 'Add to Cart' }).first().or(page.getByText('No products found')),
    ).toBeVisible({ timeout: 15000 });
  });

  test('admin login via live API returns role in token', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { email: 'admin@meridian.com', password: 'admin123' },
    });
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.access_token).toBeDefined();
    expect(body.user?.role).toBe('ADMIN');
  });

  test('full live journey: register, shop, cart, checkout, cancel order', async ({ page }) => {
    test.setTimeout(120000);
    const email = `e2e-journey-${Date.now()}@test.com`;
    const password = 'SecurePass123';

    await page.goto('/register');
    await expect(page.getByText('Registration Form')).toBeVisible({ timeout: 15000 });
    await page.getByLabel('Full Name').fill('Journey User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('combobox', { name: 'Gender' }).click();
    await page.getByRole('option', { name: 'Male', exact: true }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/login', { timeout: 15000 });

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });

    await page.goto('/products');
    await expect(page.getByText('Shop All Products')).toBeVisible({ timeout: 15000 });
    const addBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();
    await expect(page.getByRole('alert').filter({ hasText: 'Added to cart' })).toBeVisible();

    await page.goto('/dashboard/cart');
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible({ timeout: 15000 });

    const checkoutBtn = page.getByRole('button', { name: 'Checkout' });
    await expect(checkoutBtn).toBeEnabled({ timeout: 10000 });
    await checkoutBtn.click();
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
    await page.getByLabel('Customer Name').fill('Journey User');
    await page.getByLabel('Customer Email').fill(email);
    await page.getByRole('button', { name: 'Place Order' }).click({ force: true });

    await expect(page).toHaveURL('/dashboard/my-orders', { timeout: 20000 });
    await expect(page.getByText('PENDING').first()).toBeVisible();

    await page.getByRole('button', { name: 'Cancel order' }).first().click({ force: true });
    await page.getByRole('button', { name: 'Cancel Order' }).click({ force: true });
    await expect(page.getByRole('cell', { name: 'CANCELLED' }).first()).toBeVisible({ timeout: 15000 });
  });
});
