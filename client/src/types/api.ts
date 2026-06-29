export interface SessionUser {
  _id: string;
  name: string;
  role?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  msg?: string;
  token?: string;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  roles: string[];
}

export interface Category {
  id: number;
  name: string;
  status?: string;
  isFeatured: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  costPrice: number;
  discountPercent: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  isDiscountActive: boolean;
  quantity: number;
  description: string;
  image: string;
  categoryId: number;
  categoryName?: string;
  status?: string;
  isFeatured: boolean;
}

export interface SoldItem {
  orderId: number;
  orderDate: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  customerName?: string;
}

export interface MonthlyProfit {
  year: number;
  month: number;
  revenue: number;
  cost: number;
  profit: number;
  ordersCount: number;
}

export interface BestSeller {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productName?: string;
  image?: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  userId: string;
  totalPrice: number;
  status: string;
  items: CartItem[];
}

export interface PriceInfo {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: number;
  cartId: number;
  userId: string;
  price: number;
  priceInfo: PriceInfo;
  customer?: OrderCustomer;
  status: string;
  orderDate: string;
  user?: User | null;
  cart?: Cart | null;
}
