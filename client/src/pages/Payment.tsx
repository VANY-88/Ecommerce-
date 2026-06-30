import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import {
  ApiResponse,
  Order,
  OrderCustomer,
  PaymentMethod,
  CreatePaymentResponse,
} from "../types/api";

interface PaymentLocationState {
  cartId?: number;
  subtotal?: string;
  shipping?: number;
  tax?: string;
  total?: string;
  customer?: OrderCustomer;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "COD", label: "Cash on Delivery", description: "Pay with cash when your order arrives." },
  { value: "VNPay", label: "VNPay QR", description: "Pay securely via VNPay (scan QR or card)." },
  { value: "Momo", label: "Momo QR", description: "Pay securely via Momo e-wallet." },
];

function Payment() {
  const [selected, setSelected] = useState<PaymentMethod>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { cartId, subtotal, shipping, tax, total, customer } =
    (location.state as PaymentLocationState) || {};

  const handleConfirm = async () => {
    if (!cartId || !customer) {
      setError("Missing order information. Please restart checkout.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const userId = localStorage.getItem("userId");
      const orderData = {
        cartId,
        userId,
        priceInfo: {
          subtotal: Number(subtotal),
          shipping: Number(shipping),
          tax: Number(tax),
          total: Number(total),
        },
        price: Number(total),
        customer,
        paymentMethod: selected,
      };

      const createRes = await api.post<ApiResponse<Order>>("/orders/add", orderData);
      if (!createRes.data.success || !createRes.data.data) {
        setError(createRes.data.msg || "Could not create order.");
        return;
      }
      const orderId = createRes.data.data.id;

      if (selected === "COD") {
        navigate("/checkout", { state: { orderId } });
        return;
      }

      const gatewayPath = selected === "VNPay" ? "/payments/vnpay/create" : "/payments/momo/create";
      const payRes = await api.post<ApiResponse<CreatePaymentResponse>>(gatewayPath, { orderId });

      if (payRes.data.success && payRes.data.data?.paymentUrl) {
        window.location.href = payRes.data.data.paymentUrl;
      } else {
        setError(payRes.data.msg || "Could not start payment.");
      }
    } catch (err) {
      console.error("Error during payment step:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-brown-500 px-3 px-md-4 px-lg-5"
      style={{ paddingBottom: 100 }}
    >
      <div className="align-self-start mb-4 ps-2 ps-md-4">
        <BackButton />
      </div>
      <div className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5" style={{ maxWidth: 804 }}>
        <div className="d-flex flex-column gap-5">
          <h2 className="fs-display-3 text-heading-black fw-bold text-start mb-0">
            Choose your{" "}
            <span className="d-block">
              <span className="text-orange-500">Payment</span>{" "}
              <span className="text-heading-black">Method.</span>
            </span>
          </h2>

          <div className="d-flex flex-column gap-3">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                className={`text-start border rounded-4 px-4 py-3 bg-transparent ${
                  selected === opt.value ? "border-orange-500 border-2" : "border-brown-700"
                }`}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold fs-5 text-heading-black">{opt.label}</span>
                  <span
                    className={`rounded-circle border ${
                      selected === opt.value ? "bg-orange-500 border-orange-500" : "border-brown-700"
                    }`}
                    style={{ width: 18, height: 18, display: "inline-block" }}
                  />
                </div>
                <p className="text-neutral-text-gray mb-0 mt-1">{opt.description}</p>
              </button>
            ))}
          </div>

          <div className="d-flex flex-column gap-3 fs-4">
            <div className="d-flex justify-content-between">
              <span className="text-neutral-text-gray">Subtotal:</span>
              <span className="text-heading-black fw-bold">${subtotal}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-neutral-text-gray">Shipping:</span>
              <span className="text-heading-black fw-bold">${shipping}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-neutral-text-gray">Tax:</span>
              <span className="text-heading-black fw-bold">${tax}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-neutral-text-gray">Total:</span>
              <span className="text-heading-black fw-bold">${total}</span>
            </div>
          </div>

          {error && <p className="text-danger mb-0">{error}</p>}

          <Button
            text={submitting ? "Processing..." : "Confirm & Pay"}
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="w-100"
          />
        </div>
      </div>
    </div>
  );
}

export default Payment;
