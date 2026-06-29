import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { showToast } from "../utils/toast";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/forgot-password", { email });
      showToast("Password reset link sent to your email", "success");
    } catch (error) {
      showToast("Error sending password reset link", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brown-500 px-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[500px] px-8 sm:px-12 py-12 mt-[80px]">
        <form onSubmit={handleForgotPassword} className="space-y-[40px]">
          <div className="space-y-2">
            <h2 className="text-display-3 text-heading-black font-bold">
              Forgot <span className="text-orange-500">Password</span>
            </h2>
            <p className="text-neutral-text-gray text-dm-base">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full border-b-2 border-gray-300 focus:border-orange-500 outline-none py-2 text-heading-black bg-transparent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brown text-white font-bold py-4 rounded-[40px] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-center text-dm-base font-semibold text-neutral-text-gray">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-orange-500 underline font-bold"
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
