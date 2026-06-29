import { test, expect } from '@playwright/test';
import { openPublicNav } from './helpers';

test.describe('Home Page - Top Navigation', () => {
  test('should display the home page with Products and Login buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    await expect(page.getByRole('banner').getByText('MERIDIAN')).toBeVisible();
    await openPublicNav(page);
    await expect(page.getByRole('button', { name: 'Shop' }).or(page.getByRole('link', { name: 'Shop' })).first()).toBeVisible();
    const signIn = page.getByRole('button', { name: 'Sign In' }).or(page.getByRole('listitem').filter({ hasText: 'Sign In' }));
    await expect(signIn.first()).toBeVisible();
  });

  test('should navigate to products page from home', async ({ page }) => {
    await page.goto('/');
    await openPublicNav(page);
    await page.getByRole('button', { name: 'Shop' }).first().click();
    await expect(page).toHaveURL('/products');
  });

  test('should navigate to login page from home', async ({ page }) => {
    await page.goto('/');
    await openPublicNav(page);
    const signInBtn = page.getByRole('button', { name: 'Sign In' });
    if (await signInBtn.count() > 0) {
      await signInBtn.first().click();
    } else {
      await page.getByText('Sign In').click();
    }
    await expect(page).toHaveURL('/login');
  });
});
