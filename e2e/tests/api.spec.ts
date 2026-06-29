import { test, expect } from '@playwright/test';
import { makeFakeJwt } from './helpers';

test.describe('API Layer - Frontend Integration', () => {
  test('should include Authorization header in API requests when token exists', async ({ page }) => {
    const token = makeFakeJwt({ sub: 'user-1', email: 'test@example.com', role: 'CUSTOMER' });
    await page.goto('/login');
    await page.evaluate((t) => {
      localStorage.setItem('accessToken', t);
    }, token);

    let authHeader: string | null = null;
    await page.route('**/api/cart**', (route, request) => {
      authHeader = request.headers()['authorization'] || null;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'cart-1', userId: 'user-1', items: '[]' }),
      });
    });

    await page.goto('/dashboard/cart');
    await expect.poll(() => authHeader).toBe(`Bearer ${token}`);
  });

  test('should NOT include Authorization header when no token exists', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
    });

    await page.goto('/dashboard/cart');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login on 401 API response', async ({ page }) => {
    const token = makeFakeJwt({ sub: 'user-1', email: 'test@example.com', role: 'CUSTOMER' });
    await page.goto('/login');
    await page.evaluate((t) => {
      localStorage.setItem('accessToken', t);
    }, token);

    await page.route('**/api/cart**', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    await page.goto('/dashboard/cart');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
