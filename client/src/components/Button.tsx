import React from "react";
import BsButton from "react-bootstrap/Button";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  variant = "primary",
}) => {
  const variantClass = disabled
    ? "btn-brand-disabled"
    : variant === "secondary"
    ? "btn-brand-secondary"
    : "btn-brand-primary";

  return (
    <BsButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-100 rounded-pill py-3 fs-dm-base font-dm-sans fw-semibold border-0 ${variantClass} ${className}`}
    >
      {text}
    </BsButton>
  );
};

export default Button;
