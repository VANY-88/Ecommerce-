import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import CartItemRow from "../components/CartItem";
import api from "../services/api";
import { ApiResponse, Cart as CartType, CartItem } from "../types/api";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }

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
  const shipping = 5;
  const tax = useMemo(() => (subtotal * 0.1).toFixed(2), [subtotal]);
  const finalTotal = useMemo(
    () => (subtotal + shipping + parseFloat(tax)).toFixed(2),
    [subtotal, tax]
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
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row justify-between min-h-screen max-h-fit bg-brown-500 px-4 md:px-10 lg:px-20 xl:px-[120px] py-[80px] md:py-[120px] gap-6">
      {/* Cart Section */}
      <div className="w-full lg:w-2/3 bg-white rounded-3xl min-h-[474px] max-h-fit shadow-md p-8 space-y-6">
        <h2 className="text-display-4 text-heading-black font-bold font-DM Sans">
          Your <span className="text-orange-500">Cart</span>
        </h2>
        {cartItems.length > 0 ? (
          <div className="space-y-4">
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
          <p className="text-gray-500">Your cart is empty.</p>
        )}
      </div>

      {/* Order Summary Section */}
      <div className="w-full lg:w-1/3 bg-heading-black rounded-3xl shadow-md p-8 space-y-6 flex flex-col justify-between">
        <h2 className="text-display-4 text-white font-semibold font-DM Sans">
          Order Summary
        </h2>
        <div className="space-y-4 text-white text-dm-base font-DM Sans flex-grow">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shipping}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-4">
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
    </div>
  );
}

export default Cart;
