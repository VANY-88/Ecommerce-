import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "./utils/toast";
import AccessibleNavigationAnnouncer from "./components/AccessibleNavigationAnnouncer";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import api from "./services/api";
import { getRefreshToken, clearSession } from "./services/session";
import { SessionUser } from "./types/api";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Register = lazy(() => import("./pages/Register"));
const ForgetPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const SingleProductPage = lazy(() => import("./pages/SingleProductPage"));
const Cart = lazy(() => import("./pages/Cart"));
const ShippingDetails = lazy(() => import("./pages/ShippingDetails"));
const Payment = lazy(() => import("./pages/Payment"));
const PaymentResult = lazy(() => import("./pages/PaymentResult"));
const Checkout = lazy(() => import("./pages/Checkout"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

const App: React.FC = () => {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");
    if (userId && userName) {
      setUser({ _id: userId, name: userName, role: userRole || undefined });
    }
  }, []);

  const handleLogin = (loggedInUser: SessionUser & { token: string }) => {
    // Login.tsx/Register.tsx already persist the session via saveSession()
    // before calling this — this just updates in-memory app state.
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await api.post("/users/logout", { refreshToken });
      } catch {
        // Best-effort revocation — clear local session regardless.
      }
    }
    clearSession();
    setUser(null);
  };

  return (
    <Router>
      <ToastContainer />
      <AccessibleNavigationAnnouncer />
      <Header user={user} onLogout={handleLogout} />
      {/* Stable, page-content-only subtree that useHeaderTheme's
          MutationObserver watches for data-header-theme sections. */}
      <div id="app-content">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Register onLogin={handleLogin} />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/edit-profile" element={<PrivateRoute component={EditProfile} />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/products/:productId" element={<SingleProductPage />} />
            <Route path="/profile" element={<PrivateRoute component={UserProfile} />} />
            <Route path="/" element={<Navigate to="/landing" />} />
            <Route path="*" element={<Navigate to="/landing" />} />
            <Route path="/cart" element={<PrivateRoute component={Cart} />} />
            <Route path="/shipping" element={<PrivateRoute component={ShippingDetails} />} />
            <Route path="/payment" element={<PrivateRoute component={Payment} />} />
            <Route path="/payment/result" element={<PaymentResult />} />
            <Route path="/checkout/:orderId" element={<PrivateRoute component={Checkout} />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/admin/dashboard" element={<AdminRoute component={AdminDashboard} />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
