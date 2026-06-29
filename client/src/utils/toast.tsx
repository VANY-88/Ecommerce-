import React from "react";
import { toast, ToastContainer as ReactToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showToast = (message: string, type: "success" | "error" | "warn" | "info" = "info") => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warn":
      toast.warn(message);
      break;
    case "info":
    default:
      toast.info(message);
      break;
  }
};

export const ToastContainer: React.FC = () => {
  return <ReactToastContainer />;
};
