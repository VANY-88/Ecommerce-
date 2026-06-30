import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import BackButton from "../components/BackButton";
import { ApiResponse, User } from "../types/api";

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

  const handleShippingInfo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    navigate("/payment", {
      state: {
        cartId,
        subtotal,
        shipping,
        tax,
        total,
        customer: { firstName, lastName, email, phone, address },
      },
    });
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-brown-500 px-3 px-md-4 px-lg-5"
      style={{ paddingBottom: 100 }}
    >
      <div className="align-self-start mb-4 ps-2 ps-md-4">
        <BackButton />
      </div>
      <div
        className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5"
        style={{ maxWidth: 804 }}
      >
        <form onSubmit={handleShippingInfo} className="d-flex flex-column gap-5">
          <h2 className="fs-display-3 text-heading-black fw-bold text-start mb-0">
            {isLoggedIn ? (
              <>
                Please confirm your{" "}
                <span className="d-block">
                  <span className="text-orange-500">Shipping</span>{" "}
                  <span className="text-heading-black">Information.</span>
                </span>
              </>
            ) : (
              <>
                Enter your{" "}
                <span className="d-block">
                  <span className="text-orange-500">Shipping</span>{" "}
                  <span className="text-heading-black">Information.</span>
                </span>
              </>
            )}
          </h2>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex gap-3">
              <FormInput
                label="First Name"
                type="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
                className="border-bottom border-2"
              />
              <FormInput
                label="Last Name"
                type="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
                className="border-bottom border-2"
              />
            </div>
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="border-bottom border-2"
            />
            <FormInput
              label="Phone Number"
              type="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
              className="border-bottom border-2"
            />
            <FormInput
              label="Address"
              type="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              required
              className="border-bottom border-2"
            />
          </div>

          <div className="d-flex flex-column gap-3 fs-4">
            <div className="d-flex justify-content-between">
              <span className="text-gray">Subtotal:</span>
              <span className="text-heading-black fw-bold">${subtotal}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-gray">Shipping:</span>
              <span className="text-heading-black fw-bold">${shipping}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-gray">Tax:</span>
              <span className="text-heading-black fw-bold">${tax}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-gray">Total:</span>
              <span className="text-heading-black fw-bold">${total}</span>
            </div>
          </div>

          <Button
            text="Confirm Order"
            type="submit"
            className="w-100"
            disabled={!isValid}
          />

          <p className="text-center mb-0">
            {!isLoggedIn && (
              <>
                Already have an account?{" "}
                <button
                  onClick={handleLoginRedirect}
                  className="text-orange-500 text-decoration-underline border-0 bg-transparent p-0"
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
