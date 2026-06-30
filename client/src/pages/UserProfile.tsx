import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/UserProfile.css";
import Button from "../components/Button";
import { ApiResponse, User, Order } from "../types/api";

const PRODUCT_THUMB_SIZE = 140;

function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchUserOrders = async () => {
      try {
        const response = await api.get<ApiResponse<Order[]>>(`/orders/allOrder/${userId}`);
        setOrders(response.data.data || []);
      } catch (error) {
        console.error("Error fetching user orders:", error);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const userResponse = await api.get<ApiResponse<User>>(`/users/${userId}`);
        const userData = userResponse.data.data || null;
        setUser(userData);

        if (userData?.roles.includes("Admin")) {
          setLoading(false);
        } else {
          fetchUserOrders();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  if (!user) {
    return (
      <div>
        Please <Link to="/login">log in</Link> or{" "}
        <Link to="/signup">register</Link> to view your profile.
      </div>
    );
  }

  const isAdmin = user.roles.includes("Admin");

  if (isAdmin) {
    return (
      <div
        className="d-flex align-items-center justify-content-center min-vh-100 bg-brown-500 px-3"
        style={{ paddingBottom: 80 }}
      >
        <div
          className="bg-white rounded-4 shadow-lg w-100 px-4 px-sm-5 py-5 d-flex flex-column gap-4"
          style={{ maxWidth: 560 }}
        >
          <div className="d-flex align-items-center gap-3">
            <h2 className="fs-display-3 text-heading-black fw-bold mb-0">
              Admin <span className="text-orange-500">Account</span>
            </h2>
            <span className="bg-orange-500 text-white fw-semibold rounded-pill px-3 py-1 small">
              Admin
            </span>
          </div>

          <div className="d-flex flex-column gap-2 fs-dm-base text-heading-black">
            <p className="mb-0"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p className="mb-0"><strong>Email:</strong> {user.email}</p>
            <p className="mb-0"><strong>Phone:</strong> {user.phone}</p>
            <p className="mb-0"><strong>Address:</strong> {user.address}</p>
          </div>

          <div className="d-flex flex-column gap-3">
            <Button text="Go to Dashboard" onClick={() => navigate("/admin/dashboard")} />
            <Link
              to="/edit-profile"
              className="fw-semibold fs-6 text-heading-black text-decoration-none text-center"
            >
              Edit Information
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="UserProfile d-flex flex-column gap-5">
      <div className="d-flex flex-column flex-md-row justify-content-between gap-4">
        <div className="d-flex flex-column gap-3">
          <h2
            className="fs-display-3 text-heading-black fw-bold text-start"
            style={{ maxWidth: "300px" }}
          >
            User <span className="text-orange-500">Information</span>
          </h2>
          <Link to="/edit-profile" className="fw-semibold fs-6 text-heading-black text-decoration-none">
            Edit Information
          </Link>
        </div>
        <div className="UserProfile-info">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Address:</strong> {user.address}</p>
        </div>
      </div>
      <div className="UserProfile-orders d-flex flex-column gap-5">
        <h2 className="fs-display-4 fw-bold">Your Orders</h2>
        {loading ? (
          <p>Loading orders...</p>
        ) : error ? (
          <p>{error}</p>
        ) : orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <div className="orders-container">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-info">
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                  <p><strong>Total Price:</strong> ${order.price.toFixed(2)}</p>
                  <div className="price-info">
                    <p><strong>Subtotal:</strong> ${order.priceInfo?.subtotal}</p>
                    <p><strong>Shipping:</strong> ${order.priceInfo?.shipping}</p>
                    <p><strong>Tax:</strong> ${order.priceInfo?.tax}</p>
                    <p><strong>Total:</strong> ${order.priceInfo?.total}</p>
                  </div>
                  <p><strong>Status:</strong> {order.status}</p>
                </div>
                <details className="order-details">
                  <summary>View Products</summary>
                  <ul>
                    {order.cart?.items.map((item) => (
                      <li key={item.id} className="d-flex" style={{ gap: "60px" }}>
                        <img
                          src={item.image}
                          alt={item.productName}
                          style={{ width: PRODUCT_THUMB_SIZE, height: PRODUCT_THUMB_SIZE }}
                          loading="lazy"
                          decoding="async"
                        />
                        <div>
                          <p><strong>Product:</strong> {item.productName}</p>
                          <p><strong>Quantity:</strong> {item.quantity}</p>
                          <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
