import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card" style={{ marginTop: 40 }}>
        <h2>Welcome Back</h2>
        <p className="text-center text-muted mb-16" style={{ fontSize: 14 }}>
          Sign in to your ShopEasy account
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          {error && <p className="error">✕ {error}</p>}
          <button className="primary" type="submit" disabled={loading} style={{ justifyContent: "center", padding: "12px" }}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>
        <p className="text-center mt-16" style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

