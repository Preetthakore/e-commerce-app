import { useEffect, useState } from "react";
import api from "../api/axios";

const statusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "paid":
    case "delivered":
      return "paid";
    case "pending":
    case "processing":
      return "pending";
    case "cancelled":
    case "refunded":
      return "cancelled";
    default:
      return "pending";
  }
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/seller")
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>Orders Containing My Products</h2>
        <div className="loading-center">
          <div className="spinner dark" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container">
        <h2>Orders Containing My Products</h2>
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Orders containing your products will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Seller Orders</h2>
        <span className="text-muted">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      {orders.map((o) => (
        <div className="order-card" key={o._id}>
          <div className="order-header">
            <div>
              <strong style={{ fontSize: 15 }}>Order #{o._id.slice(-8).toUpperCase()}</strong>
              <div className="order-id">ID: {o._id}</div>
            </div>
            <span className={`status-badge ${statusColor(o.status)}`}>
              {o.status}
            </span>
          </div>
          <div className="order-body">
            <span><strong>Date:</strong> {new Date(o.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="order-items">
            <strong style={{ fontSize: 13, color: "var(--text-muted)" }}>My Products in this Order</strong>
            <ul>
              {o.items.map((i, idx) => (
                <li key={idx}>
                  {i.name} × {i.quantity} — <strong>₹{i.price * i.quantity}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

