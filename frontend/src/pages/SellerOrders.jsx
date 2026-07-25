import { useEffect, useState } from "react";
import api from "../api/axios";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/seller").then((res) => setOrders(res.data));
  }, []);

  const statusClass = (s) => (s === "paid" ? "paid" : s === "failed" ? "cancelled" : "pending");

  return (
    <div className="container">
      <div className="page-header"><h2>Orders Containing My Products</h2></div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No orders yet</h3>
          <p>Orders containing your products will appear here.</p>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o._id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{o._id.slice(-6)}</span>
              <span className={`status-badge ${statusClass(o.status)}`}>{o.status}</span>
            </div>
            <div className="order-body">
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