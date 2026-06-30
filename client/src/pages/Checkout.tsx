import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import api from "../services/api";
import { ApiResponse, Order, OrderCustomer, CartItem } from "../types/api";

function Checkout() {
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [customerDetails, setCustomerDetails] = useState<OrderCustomer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const { orderId } = (location.state as { orderId?: number }) || {};

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
        const data = response.data.data;
        if (!data) return;

        setOrderDetails(data);
        setCustomerDetails(data.customer || null);
        setCartItems(data.cart?.items || []);
        setTotalPrice(data.price);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleGoHome = () => {
    navigate("/");
  };

  if (!orderDetails || !customerDetails || cartItems.length === 0) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 bg-brown-500"
      style={{ paddingBottom: 120 }}
    >
      <div
        className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5 d-flex flex-column gap-5"
        style={{ maxWidth: 804 }}
      >
        <div className="text-center d-flex flex-column gap-2">
          <img
            src="./assets/orderSuccessful.png"
            alt="Order Success"
            className="mx-auto"
            style={{ width: 140, height: 140 }}
            loading="lazy"
            decoding="async"
          />
          <h2 className="fs-display-3 text-heading-black fw-bold text-center mb-0">
            Thank you!
          </h2>
          <p className="fs-dm-base fw-semibold text-brown-1000 mb-0">
            YOUR ORDER HAS BEEN PLACED.
          </p>
        </div>

        <div className="d-flex flex-column gap-3">
          <h3 className="fs-display-4 fw-bold mb-0">
            Order <span className="text-orange-500">Details</span>
          </h3>
          <ul className="d-flex flex-column gap-2 fs-dm-base text-heading-black list-unstyled mb-0">
            <li className="d-flex justify-content-between">
              <span>Order Date</span>
              <span className="fw-medium">
                {new Date(orderDetails.orderDate).toLocaleDateString()}
              </span>
            </li>
            <li className="d-flex justify-content-between">
              <span>Number of Items</span>
              <span className="fw-medium">{cartItems.length}</span>
            </li>
            <li className="d-flex justify-content-between">
              <span>Shipping Address</span>
              <span className="fw-medium">{customerDetails.address}</span>
            </li>
            <li className="d-flex justify-content-between">
              <span>Delivery Fee</span>
              <span className="fw-medium">
                ${orderDetails.priceInfo.shipping}
              </span>
            </li>
            <li className="d-flex justify-content-between">
              <span>Tax ({(orderDetails.priceInfo.taxRate * 100).toFixed(0)}%)</span>
              <span className="fw-medium">
                ${orderDetails.priceInfo.tax.toFixed(2)}
              </span>
            </li>
            <li className="d-flex justify-content-between">
              <span>Payment Method</span>
              <span className="fw-medium">
                {orderDetails.paymentMethod} ({orderDetails.paymentStatus})
              </span>
            </li>
          </ul>
          <hr className="border-brown-700 my-3" />
          <div className="d-flex justify-content-between fs-dm-base text-heading-black fw-bold">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          <h3 className="fs-display-4 fw-bold mb-0">Products</h3>
          <ul className="d-flex flex-column gap-2 fs-dm-base text-heading-black list-unstyled mb-0">
            {cartItems.map((item) => (
              <li key={item.id} className="d-flex justify-content-between">
                <span>
                  {item.productName} (x{item.quantity})
                </span>
                <span className="fw-medium">${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="d-flex flex-column gap-3">
          <h3 className="fs-display-4 fw-bold mb-0">Customer Details</h3>
          <ul className="d-flex flex-column gap-2 fs-dm-base text-heading-black list-unstyled mb-0">
            <li className="d-flex justify-content-between">
              <span>Customer Name</span>
              <span className="fw-medium">
                {customerDetails.firstName} {customerDetails.lastName}
              </span>
            </li>
            <li className="d-flex justify-content-between">
              <span>Email</span>
              <span className="fw-medium">{customerDetails.email}</span>
            </li>
            <li className="d-flex justify-content-between">
              <span>Phone</span>
              <span className="fw-medium">{customerDetails.phone}</span>
            </li>
          </ul>
        </div>

        <Button text="Back to Homepage" type="button" onClick={handleGoHome} />
      </div>
    </div>
  );
}

export default Checkout;
