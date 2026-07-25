import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders/my").then((res) => setOrders(res.data));
  }, []);

  const statusClass = (s) => (s === "paid" ? "paid" : s === "failed" ? "cancelled" : "pending");

  return (
    <div className="container">
      <div className="page-header"><h2>My Orders</h2></div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No orders yet</h3>
          <p>Your order history will show up here once you check out.</p>
          <button className="primary" onClick={() => navigate("/products")}>Browse Products</button>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o._id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{o._id.slice(-6)}</span>
              <span className={`status-badge ${statusClass(o.status)}`}>{o.status}</span>
            </div>
            <div className="order-body">
              <span><strong>Total:</strong> ₹{o.totalAmount}</span>
              <span><strong>Date:</strong> {new Date(o.createdAt).toLocaleString()}</span>
            </div>
            <ul className="order-items">
              {o.items.map((i) => (
                <li key={i.product}>{i.name} × {i.quantity} — ₹{i.price * i.quantity}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}