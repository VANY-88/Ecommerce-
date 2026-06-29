import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import api from "../services/api";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import { ApiResponse, User, SessionUser } from "../types/api";

interface RegisterProps {
  onLogin: (user: SessionUser & { token: string }) => void;
}

function Register({ onLogin }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<ApiResponse<User>>("users/register", {
        email,
        phone,
        address,
        firstName,
        lastName,
        password,
      });
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
      navigate("/");

      console.log("User registered successfully!");
    } catch (err) {
      console.log(err);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const isStep1Valid = email && phone && address && firstName && lastName;
  const isStep2Valid = password === confirmPassword && password.length >= 8;

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center bg-brown-500"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5"
        style={{ maxWidth: "804px", marginTop: "80px" }}
      >
        <Form onSubmit={handleRegister} className="d-flex flex-column gap-5">
          <p className="fs-dm-base font-dm-sans mt-2 text-start fw-semibold text-brown-900">
            STEP {currentStep} IN 2
          </p>
          <h2 className="fs-display-3 text-heading-black fw-bold text-start">
            Create a{" "}
            <span className="d-block">
              <span className="text-orange-500">Furnitech</span>{" "}
              <span className="text-heading-black">Account.</span>
            </span>
          </h2>

          {/* Step 1 */}
          {currentStep === 1 && (
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
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="d-flex flex-column gap-3">
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="border-bottom border-2"
              />
              <div className="d-flex flex-column gap-2">
                <p className="small font-dm-sans text-gray fw-semibold mb-0">
                  Make sure your password contain
                </p>
                <ul className="small font-dm-sans text-gray d-flex flex-column gap-1 ps-4 mb-0">
                  <li>Minimum of 8 characters</li>
                  <li>At least one UPPERCASE letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number or one special character</li>
                </ul>
              </div>

              <PasswordInput
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="border-bottom border-2"
              />
            </div>
          )}

          {/* Buttons to move to the next step or submit */}
          {currentStep === 1 && (
            <Button
              text="Next"
              onClick={() => setCurrentStep(2)}
              disabled={!isStep1Valid}
            />
          )}

          {currentStep === 2 && (
            <Button
              text="Register"
              type="submit"
              disabled={!isStep2Valid}
            />
          )}

          <p className="fs-dm-base font-dm-sans mt-2 text-center fw-semibold text-neutral-text-gray">
            Already have a Furnitech account?{" "}
            <button
              onClick={handleLoginRedirect}
              className="text-orange-500 text-decoration-underline fw-bold border-0 bg-transparent"
              type="button"
            >
              Login now
            </button>
          </p>
        </Form>
      </div>
    </Container>
  );
}

export default Register;
