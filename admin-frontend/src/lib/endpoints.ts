/** Named API path segments — all routes are relative to `/api` */
export const endpoints = {
  health: '/health',

  auth: {
    login: '/auth/login',
  },

  products: {
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
    byId: (id: string) => `/orders/${id}`,
    items: (id: string) => `/orders/${id}/items`,
    status: (id: string) => `/orders/${id}/status`,
    cancel: (id: string) => `/orders/${id}/cancel`,
  },

  users: {
    list: '/users',
    byId: (id: string) => `/users/${id}`,
  },
} as const;
