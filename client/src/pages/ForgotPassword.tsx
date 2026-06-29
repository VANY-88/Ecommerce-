import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
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
    <Container
      fluid
      className="d-flex align-items-center justify-content-center bg-brown-500 px-4"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5"
        style={{ maxWidth: "500px", marginTop: "80px" }}
      >
        <Form onSubmit={handleForgotPassword} className="d-flex flex-column gap-5">
          <div className="d-flex flex-column gap-2">
            <h2 className="fs-display-3 text-heading-black fw-bold">
              Forgot <span className="text-orange-500">Password</span>
            </h2>
            <p className="text-neutral-text-gray fs-dm-base">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="d-flex flex-column gap-2">
            <Form.Label htmlFor="email" className="small fw-semibold text-secondary mb-0">
              Email
            </Form.Label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-100 border-0 border-bottom border-2 py-2 text-heading-black bg-transparent"
              style={{ outline: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-100 bg-brown text-white fw-bold py-3 border-0"
            style={{ borderRadius: "40px", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-center fs-dm-base fw-semibold text-neutral-text-gray">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-orange-500 text-decoration-underline fw-bold border-0 bg-transparent"
            >
              Login here
            </button>
          </p>
        </Form>
      </div>
    </Container>
  );
};

export default ForgotPassword;
