import { Page } from '@playwright/test';

export function makeFakeJwt(payload: Record<string, string>) {
  const enc = (obj: object) => btoa(JSON.stringify(obj));
  const header = enc({ alg: 'HS256', typ: 'JWT' });
  const body = enc(payload);
  return `${header}.${body}.fake-signature`;
}

export async function submitForm(page: Page) {
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(
        new SubmitEvent('submit', { bubbles: true, cancelable: true }),
      );
    }
  });
}

export async function loginWithToken(page: Page, role: 'ADMIN' | 'CUSTOMER' = 'CUSTOMER') {
  const token = makeFakeJwt({ sub: 'user-1', email: 'test@example.com', role });

  await page.route('**/api/products**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
  });
  await page.route('**/api/admin/products**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
  });
  await page.route('**/api/orders**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
  });
  await page.route('**/api/users**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
  });
  await page.route('**/api/cart**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'cart-1', userId: 'user-1', items: '[]' }),
    });
  });
  await page.route('**/api/categories**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await page.goto('/login');
  await page.evaluate((t) => {
    localStorage.setItem('accessToken', t);
  }, token);
  await page.goto('/dashboard');
  await page.waitForTimeout(500);
}

export async function openMobileNav(page: Page) {
  try {
    const menuBtn = page.getByRole('button', { name: 'Open navigation menu' });
    await menuBtn.waitFor({ state: 'visible', timeout: 5000 });
    await menuBtn.click();
    await page.waitForTimeout(500);
  } catch {
    // Not on mobile or button never appeared
  }
}

export async function openPublicNav(page: Page) {
  try {
    const menuBtn = page.getByRole('button', { name: 'Open menu' });
    await menuBtn.waitFor({ state: 'visible', timeout: 3000 });
    await menuBtn.click();
    await page.waitForTimeout(300);
  } catch {
    // Desktop — nav links visible in header
  }
}

export async function clickSidebar(page: Page, label: string) {
  await page.locator('.MuiDrawer-paper .MuiList-root').getByRole('button', { name: label, exact: true }).click();
}

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

export async function isApiRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function isLiveBackendReady(): Promise<boolean> {
  if (!(await isApiRunning())) return false;
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@meridian.com', password: 'admin123' }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const body = await res.json();
    return body.user?.role === 'ADMIN';
  } catch {
    return false;
  }
}

export const mockProduct = {
  id: 'prod-1',
  sku: 'SKU-001',
  name: 'Test Widget',
  description: 'A test product for E2E',
  price: 19.99,
  stockQuantity: 10,
  imageUrl: '',
  categoryId: '',
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function mockPublicProducts(page: Page) {
  await page.route('**/api/products**', async (route) => {
    const url = route.request().url();
    if (route.request().method() !== 'GET') return route.continue();
    if (url.match(/\/products\/[^/?]+$/)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProduct),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [mockProduct], total: 1 }),
    });
  });
  await page.route('**/api/categories**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
}

export const mockProductsList = [
  mockProduct,
  {
    id: 'prod-2',
    sku: 'SKU-002',
    name: 'Premium Gadget',
    description: 'A premium gadget for testing',
    price: 49.99,
    stockQuantity: 25,
    imageUrl: '',
    categoryId: '',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    sku: 'SKU-003',
    name: 'Deluxe Item',
    description: 'Deluxe item description',
    price: 99.99,
    stockQuantity: 5,
    imageUrl: '',
    categoryId: '',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function mockFeaturedProducts(page: Page) {
  await page.route('**/api/products**', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockProductsList, total: mockProductsList.length }),
    });
  });
}

export async function mockCartWithItems(
  page: Page,
  items: { productId: string; quantity: number }[] = [{ productId: 'prod-1', quantity: 1 }],
) {
  const cartState = items.map((item) => ({ ...item }));

  await page.route('**/api/cart**', async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'cart-1', userId: 'user-1', items: JSON.stringify(cartState) }),
      });
      return;
    }

    if (method === 'PATCH' || method === 'PUT') {
      const body = route.request().postDataJSON() as { productId?: string; quantity?: number } | null;
      const productId = body?.productId ?? url.split('/').pop()?.split('?')[0];
      const item = cartState.find((i) => i.productId === productId);
      if (item && body?.quantity !== undefined) {
        item.quantity = body.quantity;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
  await page.route('**/api/products**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockProductsList, total: mockProductsList.length }),
    });
  });
}
