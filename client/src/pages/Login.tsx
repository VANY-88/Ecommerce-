import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import api from "../services/api";
import { saveSession } from "../services/session";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import { toast } from "react-toastify";
import { ApiResponse, User, SessionUser } from "../types/api";
import LoginIllustration from "../components/LoginIllustration";

interface LoginProps {
  onLogin: (user: SessionUser & { token: string }) => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<ApiResponse<User>>("/users/login", { email, password });
      const { data, token, refreshToken } = response.data;

      if (!data || !token || !refreshToken) return;

      const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
      const role = data.roles?.[0];

      saveSession({ id: data.id, name, role, token, refreshToken });

      onLogin({ _id: data.id, name, token, role });
      navigate(role === "Admin" ? "/admin/dashboard" : "/");
    } catch (error) {
      toast.error("Please check your login information.");
      console.error("Error logging in:", error);
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/signup");
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center bg-brown-500 px-4"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="d-flex bg-white rounded-4 shadow-lg w-100"
        style={{ maxWidth: "1020px", marginTop: "80px" }}
      >
        <div
          className="login-panel d-none d-md-flex flex-column justify-content-between rounded-start-4 p-5"
          style={{ width: "50%" }}
        >
          <div className="d-flex align-items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
              <circle className="login-logo-ring" pathLength={1} cx="16" cy="16" r="14.5" />
            </svg>
            <span className="text-white fw-bolder font-dm-sans fs-5">Furnitech</span>
          </div>

          <div className="login-illustration flex-grow-1">
            <div className="login-illustration__glow" />
            <LoginIllustration />
          </div>

          <div>
            <h3 className="text-white fw-bold font-dm-sans mb-2">Welcome back.</h3>
            <p className="text-brown-700 font-dm-sans mb-0">
              Sign in to pick up your cart, track orders, and keep shopping for pieces you'll love.
            </p>
          </div>
        </div>
        <div
          className="py-5 py-md-5 px-4 px-md-5"
          style={{ flex: "1 1 0%", minWidth: 0 }}
        >
          <Form onSubmit={handleLogin} className="d-flex flex-column gap-5">
            <h2 className="fs-display-3 text-heading-black fw-bold">
              Login to your{" "}
              <span className="text-orange-500"> Furnitech </span>
              account.
            </h2>
            <div className="d-flex flex-column gap-3">
              <FormInput
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="border-bottom border-2"
              />
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="border-bottom border-2"
              />
            </div>
            <Button type="submit" text="Login" />
            <p className="fs-dm-base font-dm-sans mt-2 text-center fw-semibold text-neutral-text-gray">
              Don't have an account?{" "}
              <button
                onClick={handleRegisterRedirect}
                className="text-orange-500 text-decoration-underline fw-bold border-0 bg-transparent"
                type="button"
              >
                Register here
              </button>
            </p>
          </Form>
        </div>
      </div>
    </Container>
  );
}

export default Login;
