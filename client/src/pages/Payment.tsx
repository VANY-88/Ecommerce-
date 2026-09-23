import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../services/api";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import { fetchPaymentStatus, isSettled, startPayment, toPaymentError } from "../services/payments";
import {
  ApiResponse,
  Order,
  OrderCustomer,
  PaymentMethod,
  PaymentStatusInfo,
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

// Two modes on one route (/payment/:orderId?):
// - new: arrived from /shipping with the cart in router state; the order is created on confirm.
// - resume: /payment/:orderId, loaded from the server — reached via Back from the gateway,
//   the result page, the order page or the profile. Lets the user retry or switch method.
function Payment() {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const draft = (location.state as PaymentLocationState) || {};

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<PaymentStatusInfo | null>(null);
  const [selected, setSelected] = useState<PaymentMethod>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [switchAfter, setSwitchAfter] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // Set when this page just created the order, so the route change to /payment/:id
  // doesn't trigger a status check racing the payment being started.
  const createdOrderId = useRef<string | null>(null);

  const loadOrder = useCallback(
    async (id: string) => {
      setLoadFailed(false);
      try {
        const [orderRes, paymentStatus] = await Promise.all([
          api.get<ApiResponse<Order>>(`/orders/${id}`),
          fetchPaymentStatus(id),
        ]);
        const loaded = orderRes.data.data!;
        if (isSettled(paymentStatus)) {
          navigate(`/checkout/${id}`, { replace: true });
          return;
        }
        setOrder(loaded);
        setStatus(paymentStatus);
        setSelected(paymentStatus.paymentMethod);
        setSwitchAfter(paymentStatus.switchAfterSeconds);
      } catch (err) {
        setError(toPaymentError(err).message);
        setLoadFailed(true);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (orderId && orderId !== createdOrderId.current) {
      loadOrder(orderId);
    }
  }, [orderId, loadOrder]);

  // Back from the gateway can restore this page from the bfcache with "Processing..."
  // still showing; reset and re-check the order instead.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setSubmitting(false);
        if (orderId) loadOrder(orderId);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [orderId, loadOrder]);

  // Count down while an open gateway payment prevents switching to another method.
  useEffect(() => {
    if (switchAfter <= 0) return;
    const timer = setTimeout(() => {
      if (switchAfter === 1 && orderId) {
        loadOrder(orderId);
      }
      setSwitchAfter((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [switchAfter, orderId, loadOrder]);

  const createOrder = async (): Promise<Order | null> => {
    if (!draft.cartId || !draft.customer) {
      setError("Missing order information. Please restart checkout.");
      return null;
    }
    const res = await api.post<ApiResponse<Order>>("/orders/add", {
      cartId: draft.cartId,
      userId: localStorage.getItem("userId"),
      priceInfo: {
        subtotal: Number(draft.subtotal),
        shipping: Number(draft.shipping),
        tax: Number(draft.tax),
        total: Number(draft.total),
      },
      price: Number(draft.total),
      customer: draft.customer,
      paymentMethod: selected,
    });
    const created = res.data.data!;
    createdOrderId.current = String(created.id);
    setOrder(created);
    // From here on this page is the order's resume page, so Back from the gateway
    // (or a refresh) lands on it instead of re-submitting the cart.
    navigate(`/payment/${created.id}`, { replace: true });
    return created;
  };

  const confirmPossiblyPaid = () =>
    window.confirm(
      "We couldn't confirm whether your previous payment went through. If you already paid, please check your orders instead of paying again. Continue with a new payment?"
    );

  const handleConfirm = async () => {
    let confirmAbandon = false;
    if (status?.warnPossiblyPaid) {
      if (!confirmPossiblyPaid()) return;
      confirmAbandon = true;
    }

    setSubmitting(true);
    setError(null);
    let redirecting = false;

    try {
      const current = order ?? (await createOrder());
      if (!current) return;

      let result;
      try {
        result = await startPayment(current, selected, confirmAbandon);
      } catch (err) {
        // The server asks before abandoning an unconfirmed payment; nothing was created yet.
        if (toPaymentError(err).code !== "CONFIRM_ABANDON" || confirmAbandon) throw err;
        if (!confirmPossiblyPaid()) return;
        result = await startPayment(current, selected, true);
      }
      if (result.kind === "settled") {
        navigate(`/checkout/${current.id}`);
        return;
      }
      redirecting = true;
      window.location.href = result.paymentUrl;
    } catch (err) {
      const paymentError = toPaymentError(err);
      if (paymentError.code === "ALREADY_PAID") {
        const id = order?.id ?? orderId;
        if (id) {
          navigate(`/checkout/${id}`, { replace: true });
          return;
        }
      }
      setError(paymentError.message);
      if (paymentError.code === "PAYMENT_IN_PROGRESS") {
        const id = order?.id ?? orderId;
        if (id) {
          // Refresh which payment is open and how long switching is blocked.
          createdOrderId.current = null;
          loadOrder(String(id));
        }
      }
    } finally {
      // Keep the button locked while the browser navigates to the gateway.
      if (!redirecting) setSubmitting(false);
    }
  };

  const priceInfo = order?.priceInfo;
  const summary = priceInfo
    ? {
        subtotal: priceInfo.subtotal.toFixed(2),
        shipping: priceInfo.shipping.toFixed(2),
        tax: priceInfo.tax.toFixed(2),
        total: priceInfo.total.toFixed(2),
      }
    : { subtotal: draft.subtotal, shipping: draft.shipping, tax: draft.tax, total: draft.total };

  const isResume = !!orderId;
  const loadingResume = isResume && !order && !loadFailed;
  const activeMethod = status?.activeAttemptMethod ?? null;
  // Continuing with the open payment's method reuses that payment while it is still valid;
  // switching away (or anything, once it has expired but may still be confirming) waits.
  const blocked =
    switchAfter > 0 && !!activeMethod && (selected !== activeMethod || !status?.continueAllowed);

  if (isResume && !order && loadFailed) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-brown-500 px-3">
        <div
          className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5 text-center d-flex flex-column gap-3"
          style={{ maxWidth: 600 }}
        >
          <h2 className="fs-display-3 text-heading-black fw-bold mb-0">Couldn't load your order</h2>
          <p className="text-neutral-text-gray mb-2">{error}</p>
          <Button text="Try Again" type="button" onClick={() => orderId && loadOrder(orderId)} />
          <Button text="View My Orders" type="button" variant="secondary" onClick={() => navigate("/profile")} />
        </div>
      </div>
    );
  }

  if (loadingResume) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-brown-500">
        <p className="text-heading-black fs-4 mb-0">Loading your order...</p>
      </div>
    );
  }

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
            {isResume ? "Complete your" : "Choose your"}{" "}
            <span className="d-block">
              <span className="text-orange-500">Payment</span>{" "}
              <span className="text-heading-black">Method.</span>
            </span>
          </h2>

          {isResume && order && (
            <div className="rounded-4 border border-brown-700 px-4 py-3">
              <p className="mb-1 fw-semibold text-heading-black">Order #{order.id}</p>
              <p className="mb-0 text-neutral-text-gray">
                {status?.paymentStatus === "Failed"
                  ? "Your last payment didn't go through. You can try again or pick another method."
                  : "This order is waiting for payment. You can continue, or switch to another method."}
              </p>
            </div>
          )}

          <div className="d-flex flex-column gap-3">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                disabled={submitting}
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
              <span className="text-heading-black fw-bold">${summary.subtotal}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-neutral-text-gray">Shipping:</span>
              <span className="text-heading-black fw-bold">${summary.shipping}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-neutral-text-gray">Tax:</span>
              <span className="text-heading-black fw-bold">${summary.tax}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-neutral-text-gray">Total:</span>
              <span className="text-heading-black fw-bold">${summary.total}</span>
            </div>
          </div>

          {activeMethod && switchAfter > 0 && (
            <p className={`mb-0 ${blocked ? "text-orange-500" : "text-neutral-text-gray"}`}>
              {!blocked
                ? `You have an open ${activeMethod} payment — continuing will take you back to it.`
                : status?.continueAllowed
                ? `Your ${activeMethod} payment is still open and could still go through. Continue with ${activeMethod}, or wait ${switchAfter}s to choose another method.`
                : `Your ${activeMethod} payment is still being confirmed. Please don't pay again — you can retry in ${switchAfter}s.`}
            </p>
          )}
          {error && !blocked && <p className="text-danger mb-0">{error}</p>}

          <Button
            text={submitting ? "Processing..." : blocked ? `Available in ${switchAfter}s` : "Confirm & Pay"}
            type="button"
            onClick={handleConfirm}
            disabled={submitting || blocked}
            className="w-100"
          />
        </div>
      </div>
    </div>
  );
}

export default Payment;
