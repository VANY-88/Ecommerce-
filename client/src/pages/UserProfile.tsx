import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/UserProfile.css";
import { ApiResponse, User, Order } from "../types/api";

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

    const fetchUserData = async () => {
      try {
        const userResponse = await api.get<ApiResponse<User>>(`/users/${userId}`);
        setUser(userResponse.data.data || null);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/login");
      }
    };

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

    fetchUserData();
    fetchUserOrders();
  }, [navigate]);

  if (!user) {
    return (
      <div>
        Please <Link to="/login">log in</Link> or{" "}
        <Link to="/signup">register</Link> to view your profile.
      </div>
    );
  }

  return (
    <div className="UserProfile space-y-[60px] md:space-y-[120px]">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="flex flex-col space-y-4">
          <h2 className="text-display-3 text-heading-black font-bold text-left max-w-[300px]">
            User <span className="text-orange-500">Information</span>
          </h2>
          <a className="font-semibold text-base text-heading-black hover:text-orange-500 hover:underline">
            Edit Information
          </a>
        </div>
        <div className="UserProfile-info">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Address:</strong> {user.address}</p>
        </div>
      </div>
      <div className="UserProfile-orders space-y-[60px]">
        <h2 className="text-display-4 font-bold">Your Orders</h2>
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
                      <li key={item.id} className="flex gap-[60px]">
                        <img src={item.image} alt={item.productName} className="w-[140px] h-[140px]" loading="lazy" decoding="async" />
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
