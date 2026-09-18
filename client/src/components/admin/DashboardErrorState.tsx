import React from "react";
import Button from "../Button";

interface DashboardErrorStateProps {
  message: string;
  onRetry: () => void;
}

const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({ message, onRetry }) => (
  <div className="d-flex flex-column align-items-center gap-3 bg-white rounded-4 border border-brown-600 px-4 py-5 text-center">
    <p className="text-red mb-0">{message}</p>
    <Button text="Retry" onClick={onRetry} className="w-auto-important px-4" />
  </div>
);

export default DashboardErrorState;
