import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button
      onClick={handleGoBack}
      className="px-3 py-2 bg-brown-400 text-brown-1000 fw-semibold fs-3 rounded border-0 btn-back"
    >
      &#8592; Back
    </button>
  );
};

export default BackButton;
