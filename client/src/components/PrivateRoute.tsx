import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const location = useLocation();

  // Remember where the user was headed (e.g. the payment result page after a gateway
  // redirect) so login can send them back there.
  return isAuthenticated
    ? <Component {...rest} />
    : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
};

export default PrivateRoute;
