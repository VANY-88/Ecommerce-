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
  refreshToken?: string;
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
  costPrice?: number;
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
  taxRate: number;
  total: number;
}

export interface AppSettings {
  taxRate: number;
  shippingFee: number;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export type PaymentMethod = "COD" | "VNPay" | "Momo";
export type PaymentStatus = "NotApplicable" | "Pending" | "Paid" | "Failed";

export interface Order {
  id: number;
  cartId: number;
  userId: string;
  price: number;
  priceInfo: PriceInfo;
  customer?: OrderCustomer;
  status: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  gatewayTransactionId?: string | null;
  orderDate: string;
  user?: User | null;
  cart?: Cart | null;
}

export interface CreatePaymentResponse {
  paymentUrl: string;
}

export interface PaymentStatusInfo {
  orderId: number;
  status: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  // The order still needs paying.
  canRetry: boolean;
  // Method of the payment still open at the gateway.
  activeAttemptMethod?: PaymentMethod | null;
  // Paying again with activeAttemptMethod reuses that open payment. When false while
  // switchAfterSeconds > 0, every method has to wait.
  continueAllowed: boolean;
  // Seconds until a different method can be chosen.
  switchAfterSeconds: number;
  // The open payment expired without the gateway confirming whether it was paid.
  warnPossiblyPaid: boolean;
}

// Machine-readable codes the API returns (in `errors.code`) with HTTP 409.
// CONFIRM_ABANDON: a previous payment's outcome is unknown; resend with confirmAbandon
// once the user accepts it may have gone through.
export type PaymentErrorCode = "ALREADY_PAID" | "PAYMENT_IN_PROGRESS" | "CONFIRM_ABANDON";
