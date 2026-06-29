import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import api from "../services/api";
import { showToast } from "../utils/toast";

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
        <h2 className="fs-display-3 text-heading-black fw-bold mb-4">Forgot Password</h2>
        <Form onSubmit={handleForgotPassword} className="d-flex flex-column gap-4">
          <Form.Group>
            <Form.Label htmlFor="email" className="small fw-semibold text-secondary">
              Email:
            </Form.Label>
            <Form.Control
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control-brand"
            />
          </Form.Group>
          <button
            type="submit"
            disabled={loading}
            className="w-100 bg-brown text-white fw-bold py-3 border-0"
            style={{ borderRadius: "40px", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </Form>
      </div>
    </Container>
  );
};

export default ResetPassword;
