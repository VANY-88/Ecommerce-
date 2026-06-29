import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="flex items-center justify-center min-h-screen bg-brown-500 px-4">
      <div className="flex bg-white rounded-3xl shadow-lg w-full max-w-[1020px] mt-[80px]">
        <div
          className="hidden md:block w-1/2 bg-cover bg-center rounded-l-3xl"
          style={{ backgroundImage: "url(./assets/loginImage.webp)" }}
        ></div>
        <div className="w-full md:w-1/2 py-16 md:py-28 px-8 md:px-16">
          <form className="space-y-[40px]" onSubmit={handleLogin}>
            <h2 className="text-display-3 text-heading-black font-bold">
              Login to your{" "}
              <span className=" text-orange-500"> Furnitech </span>
              account.
            </h2>
            <div className="space-y-4">
              <FormInput
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="border-b-2 focus:ring-0"
              />
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="border-b-2 focus:ring-0"
              />
            </div>
            <Button type="submit" text="Login" className="w-full" />
            <p className="text-dm-base font-DM Sans mt-2 text-center font-semibold text-neutral-text-gray">
              Don't have an account?{" "}
              <button
                onClick={handleRegisterRedirect}
                className="text-orange-500 underline font-bold"
                type="button"
              >
                Register here
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
