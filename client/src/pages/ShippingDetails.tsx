import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import BackButton from "../components/BackButton";
import { ApiResponse, Order, User } from "../types/api";

interface ShippingLocationState {
  cartId?: number;
  subtotal?: string;
  shipping?: number;
  tax?: string;
  total?: string;
}

function ShippingDetails() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { cartId, subtotal, shipping, tax, total } = (location.state as ShippingLocationState) || {};

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (token && userId) {
        try {
          const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
          const userData = response.data.data;

          if (userData) {
            setFirstName(userData.firstName || "");
            setLastName(userData.lastName || "");
            setEmail(userData.email);
            setPhone(userData.phone || "");
            setAddress(userData.address || "");
          }

          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const isValid = email && phone && address && firstName && lastName;

  const handleShippingInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

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
        customer: {
          firstName,
          lastName,
          email,
          phone,
          address,
        },
      };

      const response = await api.post<ApiResponse<Order>>("/orders/add", orderData);

      if (response.data.success && response.data.data) {
        const orderId = response.data.data.id;
        console.log("Order created successfully:", orderId);
        navigate("/checkout", {
          state: {
            orderId,
          },
        });
      } else {
        console.error("Error creating order:", response.data.msg);
      }
    } catch (err) {
      console.error("Error submitting shipping details:", err);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brown-500 py-[100px] md:py-[120px] px-4 md:px-10 lg:px-[80px]">
      <div className="self-start mb-8 pl-2 md:pl-8">
        <BackButton />
      </div>
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[804px] px-8 sm:px-16 py-12">
        <form onSubmit={handleShippingInfo} className="space-y-[40px]">
          <h2 className="text-display-3 text-heading-black font-bold text-left">
            {isLoggedIn ? (
              <>
                Please confirm your{" "}
                <span className="block">
                  <span className="text-orange-500">Shipping</span>{" "}
                  <span className="text-heading-black">Information.</span>
                </span>
              </>
            ) : (
              <>
                Enter your{" "}
                <span className="block">
                  <span className="text-orange-500">Shipping</span>{" "}
                  <span className="text-heading-black">Information.</span>
                </span>
              </>
            )}
          </h2>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <FormInput
                label="First Name"
                type="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
                className="border-b-2 focus:ring-0"
              />
              <FormInput
                label="Last Name"
                type="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
                className="border-b-2 focus:ring-0"
              />
            </div>
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="border-b-2 focus:ring-0"
            />
            <FormInput
              label="Phone Number"
              type="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
              className="border-b-2 focus:ring-0"
            />
            <FormInput
              label="Address"
              type="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              required
              className="border-b-2 focus:ring-0"
            />
          </div>

          <div className="space-y-4 text-xl">
            <div className="flex justify-between">
              <span className="text-gray-700">Subtotal:</span>
              <span className="text-gray-900 font-bold">${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Shipping:</span>
              <span className="text-gray-900 font-bold">${shipping}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Tax:</span>
              <span className="text-gray-900 font-bold">${tax}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total:</span>
              <span className="text-gray-900 font-bold">${total}</span>
            </div>
          </div>

          <Button
            text="Confirm Order"
            type="submit"
            className="w-full"
            disabled={!isValid}
          />

          <p className="text-center">
            {!isLoggedIn && (
              <>
                Already have an account?{" "}
                <button
                  onClick={handleLoginRedirect}
                  className="text-orange-500 underline"
                  type="button"
                >
                  Login now
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

export default ShippingDetails;
