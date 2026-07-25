import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalSales: 0 });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, o, u] = await Promise.all([
        api.get("/orders/stats"),
        api.get("/orders"),
        api.get("/users"),
      ]);
      setStats(s.data);
      setOrders(o.data);
      setUsers(u.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      load();
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Admin Dashboard</h2>
        <div className="loading-center">
          <div className="spinner dark" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Admin Dashboard</h2>
      </div>

      <div className="stats">
        <div className="stat-box">
          <div className="stat-icon">📋</div>
          <strong>{stats.totalOrders}</strong>
          <div className="stat-label">Total Paid Orders</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">💰</div>
          <strong>₹{stats.totalSales.toLocaleString("en-IN")}</strong>
          <div className="stat-label">Total Sales</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">👥</div>
          <strong>{users.length}</strong>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">📦</div>
          <strong>{orders.length}</strong>
          <div className="stat-label">All Orders</div>
        </div>
      </div>

      <h3 className="mb-16">All Orders</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: 24 }}>
                  No orders yet
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o._id}>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>#{o._id.slice(-8).toUpperCase()}</td>
                <td>
                  <strong>{o.user?.name || "Unknown"}</strong>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.user?.email}</div>
                </td>
                <td><strong>₹{o.totalAmount}</strong></td>
                <td><span className={`status-badge ${o.status === "paid" ? "paid" : "pending"}`}>{o.status}</span></td>
                <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-32 mb-16">Manage Users &amp; Roles</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td><strong>{u.name}</strong></td>
                <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                <td>
                  <span className={`status-badge ${u.role === "admin" ? "paid" : u.role === "sales_person" ? "pending" : ""}`}>
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    style={{ maxWidth: 140, padding: "6px 10px", fontSize: 13 }}
                  >
                    <option value="user">Buyer</option>
                    <option value="sales_person">Sales Person</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

