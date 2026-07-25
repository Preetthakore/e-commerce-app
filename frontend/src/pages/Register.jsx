import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card" style={{ marginTop: 40 }}>
        <h2>Create Account</h2>
        <p className="text-center text-muted mb-16" style={{ fontSize: 14 }}>
          Join ShopEasy today
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">Buyer</option>
              <option value="sales_person">Sales Person</option>
            </select>
          </div>
          {error && <p className="error">✕ {error}</p>}
          <button className="primary" type="submit" disabled={loading} style={{ justifyContent: "center", padding: "12px" }}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>
        <p className="text-center mt-16" style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

