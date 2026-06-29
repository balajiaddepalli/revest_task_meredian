import { test, expect } from '@playwright/test';
import { loginWithToken, mockCartWithItems } from './helpers';

test.describe('Cart UX - Item Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await mockCartWithItems(page, [{ productId: 'prod-1', quantity: 2 }]);
    await page.goto('/dashboard/cart');
    await expect(page.getByText('Test Widget')).toBeVisible();
  });

  test('should display subtotal for cart items', async ({ page }) => {
    await expect(page.getByText('Subtotal')).toBeVisible();
  });

  test('should increase and decrease item quantity', async ({ page }) => {
    const row = page.getByRole('row', { name: /Test Widget/ });
    await row.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(row.getByText('3')).toBeVisible();
    await row.getByRole('button', { name: 'Decrease quantity' }).click();
    await expect(row.getByText('2')).toBeVisible();
  });

  test('should open clear cart confirmation dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Clear Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Clear cart?' })).toBeVisible();
    await expect(page.getByText('Remove all items from your cart?')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Clear cart?' })).not.toBeVisible();
  });

  test('should navigate to products via Browse Products button', async ({ page }) => {
    await page.getByRole('main').getByRole('button', { name: 'Browse Products' }).first().click();
    await expect(page).toHaveURL('/products');
  });

  test('should enable checkout when cart has items', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeEnabled();
  });
});

test.describe('Cart UX - Checkout Dialog', () => {
  test('should show COD payment option in checkout', async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');
    await mockCartWithItems(page);
    await page.goto('/dashboard/cart');
    await expect(page.getByText('Test Widget')).toBeVisible();

    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
    await expect(page.getByLabel('Customer Name')).toBeVisible();
    await expect(page.getByLabel('Customer Email')).toBeVisible();
    await expect(page.getByRole('radio', { name: /Cash on Delivery/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Place Order' })).toBeVisible();
  });
});
