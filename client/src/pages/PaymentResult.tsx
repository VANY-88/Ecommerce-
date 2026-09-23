import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import { fetchPaymentStatus, isSettled } from "../services/payments";
import { PaymentStatusInfo } from "../types/api";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10;

type View = "checking" | "failed" | "pending" | "unknown";

// Landing page after the gateway redirect. The redirect itself is never trusted for the
// outcome: the order's payment status is read (and reconciled with the gateway) on the server.
function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method") === "momo" ? "Momo" : "VNPay";

  const [view, setView] = useState<View>(orderId ? "checking" : "unknown");
  const [status, setStatus] = useState<PaymentStatusInfo | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async (attempt: number) => {
      try {
        const info = await fetchPaymentStatus(orderId);
        if (cancelled) return;
        setStatus(info);
        if (isSettled(info)) {
          navigate(`/checkout/${orderId}`, { replace: true });
          return;
        }
        if (info.paymentStatus === "Failed") {
          setView("failed");
          return;
        }
      } catch {
        if (cancelled) return;
      }
      if (attempt + 1 >= MAX_POLLS) {
        setView("pending");
        return;
      }
      timer = setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS);
    };

    poll(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId, navigate]);

  if (view === "checking") {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-brown-500 px-3 text-center">
        <p className="text-heading-black fs-4 mb-2">Confirming your {method} payment...</p>
        <p className="text-neutral-text-gray mb-0">Please don't close this page or pay again.</p>
      </div>
    );
  }

  const content = {
    failed: {
      title: "Payment Failed",
      body: `Your ${method} payment was not completed. Your order is saved — you can try again or choose another payment method.`,
    },
    pending: {
      title: "Payment Being Confirmed",
      body: `We haven't received confirmation of your ${method} payment yet. If you completed it, please don't pay again — it will show up on your order shortly.`,
    },
    unknown: {
      title: "Payment Not Confirmed",
      body: "We couldn't match this payment to an order. Please check your orders before trying again.",
    },
  }[view];

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-brown-500 px-3">
      <div
        className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5 text-center d-flex flex-column gap-3"
        style={{ maxWidth: 600 }}
      >
        <h2 className="fs-display-3 text-heading-black fw-bold mb-0">{content.title}</h2>
        <p className="text-neutral-text-gray mb-2">{content.body}</p>
        {orderId && view === "failed" && (
          <Button text="Try Again / Change Method" type="button" onClick={() => navigate(`/payment/${orderId}`)} />
        )}
        {orderId && view === "pending" && status?.canRetry && (
          <Button text="Choose Another Method" type="button" variant="secondary" onClick={() => navigate(`/payment/${orderId}`)} />
        )}
        <Button
          text="View My Orders"
          type="button"
          variant={view === "failed" ? "secondary" : "primary"}
          onClick={() => navigate("/profile")}
        />
      </div>
    </div>
  );
}

export default PaymentResult;
