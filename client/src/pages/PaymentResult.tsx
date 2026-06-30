import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/Button";

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");
  const result = searchParams.get("result");
  const method = searchParams.get("method");

  useEffect(() => {
    if (result === "success" && orderId) {
      navigate("/checkout", { state: { orderId: Number(orderId) }, replace: true });
    }
  }, [result, orderId, navigate]);

  if (result === "success") {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-brown-500">
        <p className="text-heading-black fs-4 mb-0">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-brown-500 px-3">
      <div
        className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5 text-center"
        style={{ maxWidth: 600 }}
      >
        <h2 className="fs-display-3 text-heading-black fw-bold mb-3">Payment Failed</h2>
        <p className="text-neutral-text-gray mb-4">
          Your {method === "momo" ? "Momo" : "VNPay"} payment was not completed. You can try again from your cart.
        </p>
        <Button text="Back to Cart" type="button" onClick={() => navigate("/cart")} />
      </div>
    </div>
  );
}

export default PaymentResult;
