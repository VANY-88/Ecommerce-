import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Form from "react-bootstrap/Form";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form.Group className="mb-2">
      <Form.Label className="fs-5 text-neutral-text-gray font-dm-sans fw-semibold">
        {label}
      </Form.Label>
      <div className="position-relative">
        <Form.Control
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`form-control-brand ${className}`}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="position-absolute top-50 end-0 me-3 translate-middle-y text-brown-1000 fs-4 bg-transparent border-0"
        >
          {!showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </Form.Group>
  );
};

export default PasswordInput;
