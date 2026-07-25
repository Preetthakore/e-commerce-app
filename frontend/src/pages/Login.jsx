import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_MAP = { buyer: "user", seller: "sales_person", admin: "admin" };

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginAs, setLoginAs] = useState("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.role !== ROLE_MAP[loginAs]) {
        logout();
        setError(`This account is not registered as a ${loginAs}. Please select the correct option.`);
        setLoading(false);
        return;
      }

      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-8">
            {["buyer", "seller", "admin"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setLoginAs(opt)}
                className={loginAs === opt ? "primary" : "secondary"}
                style={{ flex: 1, textTransform: "capitalize" }}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : `Login as ${loginAs}`}
          </button>
        </form>
        <p className="mt-16 text-center text-muted">
          No account? <Link to="/register">Register as Buyer</Link>
        </p>
      </div>
    </div>
  );
}