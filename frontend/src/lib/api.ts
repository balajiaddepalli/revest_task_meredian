import axios from 'axios';
import { endpoints } from './endpoints';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const healthApi = {
  getHealthStatus: () => api.get<{ status: string; timestamp: string }>(endpoints.health),
};

export const authApi = {
  registerAccount: (data: {
    email: string;
    password: string;
    fullName: string;
    gender?: string;
  }) => api.post(endpoints.auth.register, data),
  login: (data: { email: string; password: string }) => api.post(endpoints.auth.login, data),
};

export const productApi = {
  listProducts: (params?: {
    search?: string;
    includeDeleted?: string;
    categoryId?: string;
    skip?: number;
    take?: number;
  }) => {
    if (params?.includeDeleted) {
      return api.get(endpoints.products.listAdmin, { params });
    }
    return api.get(endpoints.products.list, { params });
  },
  getProduct: (id: string) => api.get(endpoints.products.byId(id)),
  createProduct: (data: Record<string, unknown>) => api.post(endpoints.products.create, data),
  updateProduct: (id: string, data: Record<string, unknown>) => api.put(endpoints.products.byId(id), data),
  archiveProduct: (id: string) => api.delete(endpoints.products.byId(id)),
  restoreProduct: (id: string) => api.post(endpoints.products.restore(id)),
};

export const categoryApi = {
  listCategories: () => api.get(endpoints.categories.list),
  getCategory: (id: string) => api.get(endpoints.categories.byId(id)),
  createCategory: (data: { name: string }) => api.post(endpoints.categories.list, data),
  updateCategory: (id: string, data: { name: string }) => api.put(endpoints.categories.byId(id), data),
  deleteCategory: (id: string) => api.delete(endpoints.categories.byId(id)),
};

export const orderApi = {
  listOrders: (params?: { skip?: number; take?: number }) => api.get(endpoints.orders.list, { params }),
  listMyOrders: () => api.get(endpoints.orders.listMine),
  getOrder: (id: string) => api.get(endpoints.orders.byId(id)),
  listOrderItems: (id: string) => api.get(endpoints.orders.items(id)),
  createOrder: (data: Record<string, unknown>) => api.post(endpoints.orders.list, data),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(endpoints.orders.status(id), { status }),
  cancelOrder: (id: string) => api.post(endpoints.orders.cancel(id)),
  deleteOrder: (id: string) => api.delete(endpoints.orders.byId(id)),
};

export const userApi = {
  getMyProfile: () => api.get(endpoints.users.profile),
  updateMyProfile: (data: Record<string, unknown>) => api.put(endpoints.users.profile, data),
  listUsers: (params?: { skip?: number; take?: number }) => api.get(endpoints.users.list, { params }),
  getUser: (id: string) => api.get(endpoints.users.byId(id)),
  updateUser: (id: string, data: Record<string, unknown>) => api.put(endpoints.users.byId(id), data),
};

export const cartApi = {
  getCart: () => api.get(endpoints.cart.get),
  addToCart: (productId: string, quantity: number) =>
    api.post(endpoints.cart.addItem, { productId, quantity }),
  updateCartItem: (productId: string, quantity: number) =>
    api.patch(endpoints.cart.updateItem, { productId, quantity }),
  removeFromCart: (productId: string) =>
    api.delete(endpoints.cart.removeItem(productId)),
  clearCart: () => api.delete(endpoints.cart.clearItems),
  checkout: (customerName: string, customerEmail: string, paymentMethod?: string) =>
    api.post(endpoints.cart.checkout, {
      customerName,
      customerEmail,
      paymentMethod: paymentMethod || 'COD',
    }),
};

export function decodeJwtPayload(): Record<string, string> | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function getJwtUserId(): string {
  return decodeJwtPayload()?.sub || '';
}

export function getJwtEmail(): string {
  const payload = decodeJwtPayload();
  return payload?.email || payload?.username || '';
}

export function getJwtRole(): 'ADMIN' | 'CUSTOMER' {
  const role = decodeJwtPayload()?.role;
  return role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
}

export default api;
