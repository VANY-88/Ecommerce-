import api from "./api";
import {
  ApiResponse,
  CreatePaymentResponse,
  Order,
  PaymentErrorCode,
  PaymentMethod,
  PaymentStatusInfo,
} from "../types/api";

export interface PaymentError {
  code?: PaymentErrorCode;
  retryAfterSeconds?: number;
  message: string;
}

// Normalizes an axios error from the order/payment endpoints.
export function toPaymentError(err: any): PaymentError {
  const body = err?.response?.data;
  return {
    code: body?.errors?.code,
    retryAfterSeconds: body?.errors?.retryAfterSeconds,
    message: body?.msg || "Something went wrong. Please try again.",
  };
}

// True when there is nothing left to pay (paid online, or cash on delivery).
export function isSettled(order: Pick<Order, "paymentMethod" | "paymentStatus">): boolean {
  return order.paymentStatus === "Paid" || order.paymentMethod === "COD";
}

export async function fetchPaymentStatus(orderId: number | string): Promise<PaymentStatusInfo> {
  const res = await api.get<ApiResponse<PaymentStatusInfo>>(`/orders/${orderId}/payment-status`);
  return res.data.data!;
}

export type StartPaymentResult =
  | { kind: "settled" }
  | { kind: "redirect"; paymentUrl: string };

// Pays an existing order with `method`: switches the method first if needed, then asks
// the server for a gateway URL. The server decides whether a new attempt is allowed;
// `confirmAbandon` says the user accepted that an unconfirmed earlier payment may have gone through.
export async function startPayment(
  order: Order,
  method: PaymentMethod,
  confirmAbandon = false
): Promise<StartPaymentResult> {
  let current = order;
  if (isSettled(current)) {
    return { kind: "settled" };
  }

  if (current.paymentMethod !== method) {
    const res = await api.put<ApiResponse<Order>>(`/orders/${current.id}/payment-method`, {
      paymentMethod: method,
      confirmAbandon,
    });
    current = res.data.data!;
  }

  if (method === "COD") {
    return { kind: "settled" };
  }

  const path = method === "VNPay" ? "/payments/vnpay/create" : "/payments/momo/create";
  const res = await api.post<ApiResponse<CreatePaymentResponse>>(path, { orderId: current.id, confirmAbandon });
  return { kind: "redirect", paymentUrl: res.data.data!.paymentUrl };
}
