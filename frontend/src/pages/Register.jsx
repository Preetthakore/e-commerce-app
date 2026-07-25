import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, "user");
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Register"}
          </button>
        </form>
        <p className="mt-12 text-muted" style={{ fontSize: 13 }}>
          Want to sell on ShopEasy? Seller accounts are created by an admin.
        </p>
        <p className="mt-8 text-center">Have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}