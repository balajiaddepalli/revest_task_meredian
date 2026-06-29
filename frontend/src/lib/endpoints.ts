/** Named API path segments — all routes are relative to `/api` */
export const endpoints = {
  health: '/health',

  auth: {
    register: '/auth/register',
    login: '/auth/login',
  },

  products: {
    list: '/products',
    listAdmin: '/admin/products',
    create: '/products',
    byId: (id: string) => `/products/${id}`,
    restore: (id: string) => `/products/${id}/restore`,
  },

  categories: {
    list: '/categories',
    byId: (id: string) => `/categories/${id}`,
  },

  orders: {
    list: '/orders',
    listMine: '/orders/my-orders',
    byId: (id: string) => `/orders/${id}`,
    items: (id: string) => `/orders/${id}/items`,
    status: (id: string) => `/orders/${id}/status`,
    cancel: (id: string) => `/orders/${id}/cancel`,
  },

  users: {
    profile: '/users/profile',
    list: '/users',
    byId: (id: string) => `/users/${id}`,
  },

  cart: {
    get: '/cart',
    addItem: '/cart/items',
    updateItem: '/cart/items',
    removeItem: (productId: string) => `/cart/items?productId=${encodeURIComponent(productId)}`,
    clearItems: '/cart/items/clear',
    checkout: '/cart/checkout',
  },
} as const;
