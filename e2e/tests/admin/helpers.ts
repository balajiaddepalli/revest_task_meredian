import { Page } from '@playwright/test';

export function makeFakeJwt(payload: Record<string, string>) {
  const enc = (obj: object) => btoa(JSON.stringify(obj));
  const header = enc({ alg: 'HS256', typ: 'JWT' });
  const body = enc(payload);
  return `${header}.${body}.fake-signature`;
}

export async function loginWithToken(page: Page, role: 'ADMIN' | 'CUSTOMER' = 'ADMIN') {
  const token = makeFakeJwt({ sub: 'user-1', email: 'test@example.com', role });

  await page.route('**/api/admin/products**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
  });
  await page.route('**/api/products**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
  });
  await page.route('**/api/orders**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
  });
  await page.route('**/api/users**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
  });
  await page.route('**/api/categories**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await page.goto('/login');
  await page.evaluate((t) => {
    localStorage.setItem('accessToken', t);
  }, token);
  await page.goto('/');
  await page.waitForTimeout(500);
}

export async function openMobileNav(page: Page) {
  try {
    const menuBtn = page.getByRole('button', { name: 'Open navigation menu' });
    await menuBtn.waitFor({ state: 'visible', timeout: 5000 });
    await menuBtn.click();
    await page.waitForTimeout(500);
  } catch {
    // Desktop layout
  }
}
