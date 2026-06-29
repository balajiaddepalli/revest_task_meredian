import { test, expect } from '@playwright/test';
import { isLiveBackendReady } from './helpers';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

test.describe.configure({ mode: 'serial' });

test.describe('Docker Compose Integration (live)', () => {
  let token = '';
  let userId = '';
  let productId = '';
  let registeredEmail = '';

  test.beforeAll(async () => {
    if (!(await isLiveBackendReady())) {
      test.skip(true, 'Live backend not ready — run ./scripts/setup-backend.sh with services up');
    }
  });

  test('all services are healthy via health endpoint', async () => {
    const res = await fetch(`${API_URL}/health`);
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('register a new user', async () => {
    registeredEmail = `test-${Date.now()}@example.com`;
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredEmail,
        password: 'password123',
        fullName: 'Test User',
        gender: 'Male',
      }),
    });
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    expect(body.user).toBeDefined();
    token = body.access_token;
    userId = body.user.id;
  });

  test('login with admin user returns ADMIN role', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@meridian.com',
        password: 'admin123',
      }),
    });
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    expect(body.access_token).toBeDefined();
    expect(body.user?.role).toBe('ADMIN');
    token = body.access_token;
    userId = body.user.id;
  });

  test('create a product', async () => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sku: `SKU-${Date.now()}`,
        name: 'Test Product',
        price: 29.99,
        stockQuantity: 100,
        description: 'A test product',
      }),
    });
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    expect(body.id).toBeDefined();
    productId = body.id;
  });

  test('browse products (public)', async () => {
    const res = await fetch(`${API_URL}/products`);
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    expect(body.data || body).toBeDefined();
  });

  test('add to cart and checkout', async () => {
    const addRes = await fetch(`${API_URL}/cart/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity: 2 }),
    });
    expect(addRes.ok).toBeTruthy();

    const checkoutRes = await fetch(`${API_URL}/cart/${userId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerName: 'Test User',
        customerEmail: registeredEmail || 'test@example.com',
        paymentMethod: 'COD',
      }),
    });
    expect(checkoutRes.ok).toBeTruthy();
    const order = await checkoutRes.json();
    expect(order.id).toBeDefined();
    expect(order.totalPrice).toBe(59.98);
  });

  test('verify order appears in my orders', async () => {
    const res = await fetch(`${API_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    const orders = body.data || body;
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders.length).toBeGreaterThanOrEqual(1);
  });

  test('categories can be created and listed', async () => {
    const createRes = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: `Test Category ${Date.now()}` }),
    });
    expect(createRes.ok).toBeTruthy();

    const listRes = await fetch(`${API_URL}/categories`);
    expect(listRes.ok).toBeTruthy();
    const body = await listRes.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('product quantity can be updated in cart', async () => {
    const addRes = await fetch(`${API_URL}/cart/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    expect(addRes.ok).toBeTruthy();

    const updateRes = await fetch(`${API_URL}/cart/${userId}/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: 5 }),
    });
    expect(updateRes.ok).toBeTruthy();
  });
});
