import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import api from "../services/api";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import { toast } from "react-toastify";
import { ApiResponse, User, SessionUser } from "../types/api";

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
      const { data, token } = response.data;

      if (!data || !token) return;

      const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
      const role = data.roles?.[0];

      localStorage.setItem("userId", data.id);
      localStorage.setItem("token", token);
      localStorage.setItem("userName", name);
      if (role) {
        localStorage.setItem("userRole", role);
      }

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
          className="d-none d-md-block rounded-start-4"
          style={{
            width: "50%",
            backgroundImage: "url(./assets/loginImage.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="w-100 col-md-6 py-5 py-md-5 px-4 px-md-5">
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
