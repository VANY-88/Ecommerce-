import React from "react";
import Form from "react-bootstrap/Form";

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  className = "",
}) => {
  return (
    <Form.Group className="mb-2">
      <Form.Label className="fs-5 text-neutral-text-gray font-dm-sans fw-semibold">
        {label}
      </Form.Label>
      <Form.Control
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`form-control-brand ${className}`}
      />
    </Form.Group>
  );
};

export default FormInput;
