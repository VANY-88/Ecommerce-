import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "../components/Button";
import CartItemRow from "../components/CartItem";
import api from "../services/api";
import { ApiResponse, Cart as CartType, CartItem, AppSettings } from "../types/api";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get<ApiResponse<AppSettings>>("/settings");
        if (response.data.success && response.data.data) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }

    fetchSettings();
  }, []);

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem("userId");

        const response = await api.get<ApiResponse<CartType>>(`/carts/${userId}`);
        if (response.data.success && response.data.data) {
          const cartData = response.data.data;
          setCartId(cartData.id);
          setCartItems(cartData.items);
        } else {
          throw new Error("Failed to fetch cart data");
        }
      } catch (error: any) {
        setError(error.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [navigate]);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price, 0),
    [cartItems]
  );
  const shipping = settings?.shippingFee ?? 5;
  const taxRate = settings?.taxRate ?? 0.1;
  const tax = useMemo(() => (subtotal * taxRate).toFixed(2), [subtotal, taxRate]);
  const finalTotal = useMemo(
    () => (subtotal + shipping + parseFloat(tax)).toFixed(2),
    [subtotal, shipping, tax]
  );

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await api.post<ApiResponse<CartType>>(`/carts/modify`, {
        userId,
        itemId,
        quantity: newQuantity,
      });
      if (response.data.success && response.data.data) {
        const updatedCart = response.data.data;
        setCartItems(updatedCart.items);
      } else {
        alert("Failed to modify item quantity.");
      }
    } catch (error) {
      console.error("Failed to modify item quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await api.post<ApiResponse<CartType>>(`/carts/remove-item`, {
        userId,
        itemId,
      });
      if (response.data.success && response.data.data) {
        const updatedCart = response.data.data;
        setCartItems(updatedCart.items);
      } else {
        alert("Failed to remove item.");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center text-red">
        Error: {error}
      </div>
    );
  }

  return (
    <Row
      className="justify-content-between mx-0 bg-brown-500 px-3 px-md-4 px-lg-5 g-3"
      style={{ minHeight: "100vh", paddingBottom: 80 }}
    >
      {/* Cart Section */}
      <Col xs={12} lg={8}>
        <div
          className="w-100 bg-white rounded-4 shadow-sm p-4 d-flex flex-column gap-4"
          style={{ minHeight: 474 }}
        >
          <h2 className="fs-display-4 text-heading-black fw-bold font-dm-sans mb-0">
            Your <span className="text-orange-500">Cart</span>
          </h2>
          {cartItems.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={handleRemoveItem}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray mb-0">Your cart is empty.</p>
          )}
        </div>
      </Col>

      {/* Order Summary Section */}
      <Col xs={12} lg={4}>
        <div className="w-100 bg-heading-black rounded-4 shadow-sm p-4 d-flex flex-column justify-content-between gap-4 h-100">
          <h2 className="fs-display-4 text-white fw-semibold font-dm-sans mb-0">
            Order Summary
          </h2>
          <div className="d-flex flex-column gap-3 text-white fs-dm-base font-dm-sans flex-grow-1">
            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Shipping</span>
              <span>${shipping}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Tax</span>
              <span>${tax}</span>
            </div>
            <div className="d-flex justify-content-between fs-5 fw-bold border-top pt-4">
              <span>Total</span>
              <span>${finalTotal}</span>
            </div>
          </div>
          <Button
            text="Proceed to Checkout"
            onClick={() =>
              navigate("/shipping", {
                state: {
                  cartId,
                  subtotal: subtotal.toFixed(2),
                  shipping,
                  tax,
                  total: finalTotal,
                },
              })
            }
            variant="secondary"
            className="mt-auto"
          />
        </div>
      </Col>
    </Row>
  );
}

export default Cart;
