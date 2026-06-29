import { test, expect } from '@playwright/test';
import { mockPublicProducts } from './helpers';

test.describe('Guest Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    await mockPublicProducts(page);
  });

  test('should redirect to login when guest clicks Add to Cart on shop page', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText('Shop All Products')).toBeVisible();
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when guest clicks Add to Cart on product detail', async ({ page }) => {
    await page.goto('/products/prod-1');
    await expect(page.getByRole('heading', { name: 'Test Widget' })).toBeVisible();
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page).toHaveURL('/login');
  });
});
