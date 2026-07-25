import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalSales: 0 });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [sellerForm, setSellerForm] = useState({ name: "", email: "", password: "" });
  const [sellerError, setSellerError] = useState("");
  const { showToast } = useToast();

  const load = async () => {
    const [s, o, u] = await Promise.all([
      api.get("/orders/stats"),
      api.get("/orders"),
      api.get("/users"),
    ]);
    setStats(s.data);
    setOrders(o.data);
    setUsers(u.data);
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    await api.put(`/users/${id}/role`, { role });
    showToast("Role updated", "success");
    load();
  };

  const createSeller = async (e) => {
    e.preventDefault();
    setSellerError("");
    try {
      await api.post("/users", { ...sellerForm, role: "sales_person" });
      showToast(`Seller account created for ${sellerForm.name}`, "success");
      setSellerForm({ name: "", email: "", password: "" });
      load();
    } catch (err) {
      setSellerError(err.response?.data?.message || "Failed to create seller");
    }
  };

  const statusClass = (s) => (s === "paid" ? "paid" : s === "failed" ? "cancelled" : "pending");

  return (
    <div className="container">
      <div className="page-header"><h2>Admin Dashboard</h2></div>

      <div className="stats">
        <div className="stat-box">
          <div className="stat-icon">📦</div>
          <strong>{stats.totalOrders}</strong>
          <div className="stat-label">Total Paid Orders</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">₹</div>
          <strong>₹{stats.totalSales}</strong>
          <div className="stat-label">Total Sales</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">👥</div>
          <strong>{users.length}</strong>
          <div className="stat-label">Total Users</div>
        </div>
      </div>

      <div className="form-card wide">
        <h2>Create Seller Account</h2>
        <p className="text-muted mb-16" style={{ fontSize: 13.5, marginTop: -12 }}>
          Sales Person accounts can only be created here — self-registration only creates buyer accounts.
        </p>
        <form onSubmit={createSeller}>
          <div className="form-group">
            <label>Seller Name</label>
            <input value={sellerForm.name} onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Seller Email</label>
            <input type="email" value={sellerForm.email} onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Temporary Password</label>
            <input type="password" value={sellerForm.password} onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })} required />
          </div>
          {sellerError && <p className="error">{sellerError}</p>}
          <button className="primary" type="submit" style={{ width: "fit-content" }}>Create Seller</button>
        </form>
      </div>

      <div className="page-header mt-32"><h2>All Orders</h2></div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Order ID</th><th>User</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td className="order-id">{o._id.slice(-6)}</td>
                <td>{o.user?.name} ({o.user?.email})</td>
                <td>₹{o.totalAmount}</td>
                <td><span className={`status-badge ${statusClass(o.status)}`}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="page-header mt-32"><h2>Manage Users & Roles</h2></div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Change</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                    <option value="user">user</option>
                    <option value="sales_person">sales_person</option>
                    <option value="admin">admin</option>
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