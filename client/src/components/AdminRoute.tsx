import React from "react";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ component: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const isAdmin = localStorage.getItem("userRole") === "Admin";

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return <Component {...rest} />;
};

export default AdminRoute;
