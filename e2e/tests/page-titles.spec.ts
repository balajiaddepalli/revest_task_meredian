import { test, expect } from '@playwright/test';
import { loginWithToken, mockPublicProducts, mockProduct } from './helpers';

test.describe('Page Titles', () => {
  test('public pages have correct document titles', async ({ page }) => {
    const publicPages: [string, RegExp][] = [
      ['/', /Home \| Meridian/],
      ['/products', /Shop \| Meridian/],
      ['/login', /Sign In \| Meridian/],
      ['/register', /Register \| Meridian/],
      ['/does-not-exist', /Page Not Found \| Meridian/],
    ];

    await mockPublicProducts(page);

    for (const [path, title] of publicPages) {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
    }

    await page.goto(`/products/${mockProduct.id}`);
    await expect(page).toHaveTitle(new RegExp(`${mockProduct.name} \\| Meridian`));
  });

  test('authenticated pages have correct document titles', async ({ page }) => {
    await loginWithToken(page, 'CUSTOMER');

    const authPages: [string, RegExp][] = [
      ['/dashboard', /My Account \| Meridian/],
      ['/dashboard/my-orders', /My Orders \| Meridian/],
      ['/dashboard/cart', /Cart \| Meridian/],
      ['/dashboard/profile', /Profile \| Meridian/],
    ];

    for (const [path, title] of authPages) {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
    }
  });
});
