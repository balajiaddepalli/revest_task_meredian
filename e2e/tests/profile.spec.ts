import { test, expect } from '@playwright/test';
import { loginWithToken } from './helpers';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');

    await page.route('**/api/users/profile**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-1',
            email: 'test@example.com',
            fullName: 'Test User',
            gender: 'Male',
            role: 'CUSTOMER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/dashboard/profile');
    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible();
  });

  test('should display gender select with accessible label', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Gender' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Gender' })).toContainText('Male');
  });

  test('should allow changing gender', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Gender' }).click();
    await page.getByRole('option', { name: 'Female', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Gender' })).toContainText('Female');
  });
});
