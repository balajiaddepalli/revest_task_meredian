export interface FormFieldConfig {
  id: number;
  name: string;
  fieldType: 'TEXT' | 'LIST' | 'RADIO';
  inputType?: 'email' | 'password' | 'text';
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  required: boolean;
  listOfValues1?: string[];
}

export interface FormConfig {
  data: FormFieldConfig[];
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  gender?: string;
  role?: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  categoryId?: string;
  category?: Category;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  userId?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: 'ADMIN' | 'CUSTOMER';
}
