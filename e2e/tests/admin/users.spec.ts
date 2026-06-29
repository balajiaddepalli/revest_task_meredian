import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

test.describe('Admin Users Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page);
    await page.route('**/api/users**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'u1', fullName: 'Admin User', email: 'admin@meridian.com', role: 'ADMIN',
              gender: 'Male', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            },
            {
              id: 'u2', fullName: 'Jane Customer', email: 'jane@test.com', role: 'CUSTOMER',
              gender: 'Female', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            },
          ],
          total: 2,
        }),
      });
    });
    await page.goto('/users');
    await page.waitForTimeout(1000);
  });

  test('should render users page with table columns', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
  });

  test('should display user rows from API', async ({ page }) => {
    await expect(page.getByText('Admin User')).toBeVisible();
    await expect(page.getByText('admin@meridian.com')).toBeVisible();
    await expect(page.getByText('Jane Customer')).toBeVisible();
  });

  test('should not show Love React column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Love React' })).toHaveCount(0);
    await expect(page.getByText('Love React')).toHaveCount(0);
  });
});
