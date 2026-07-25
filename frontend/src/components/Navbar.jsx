import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user?.role === "user") {
      api
        .get("/cart")
        .then((res) => {
          const count = res.data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
          setCartCount(count);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const navLinks = [
    { to: "/", label: "Products", roles: null },
    { to: "/cart", label: `Cart${cartCount > 0 ? ` (${cartCount})` : ""}`, roles: ["user"] },
    { to: "/wishlist", label: "Wishlist", roles: ["user"] },
    { to: "/orders", label: "My Orders", roles: ["user"] },
    { to: "/manage-products", label: "Add Product", roles: ["admin", "sales_person"] },
    { to: "/seller-orders", label: "Seller Orders", roles: ["sales_person"] },
    { to: "/admin", label: "Admin", roles: ["admin"] },
  ];

  const visibleLinks = navLinks.filter(
    (l) => !l.roles || (user && l.roles.includes(user.role))
  );

  return (
    <>
      <nav>
        <Link to="/" className="brand">
          ShopEasy
        </Link>

        {!user && (
          <div className="links" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Link to="/login" className={isActive("/login") ? "active" : ""}>Login</Link>
            <Link to="/register" className={isActive("/register") ? "active" : ""}>Register</Link>
            <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        )}

        {user && (
          <div className="links">
            {visibleLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={isActive(l.to) ? "active" : ""}
              >
                {l.label}
              </Link>
            ))}
            <div className="user-menu" onClick={handleLogout} title="Logout">
              <div className="avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13 }}>{user.name}</span>
            </div>
            <button
              className="hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}>
        {visibleLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={isActive(l.to) ? "active" : ""}
            onClick={closeMobile}
          >
            {l.label}
          </Link>
        ))}
        {user && (
          <>
            <div style={{ padding: "8px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 8 }}>
              Logged in as <strong>{user.name}</strong> ({user.role})
            </div>
            <button onClick={handleLogout} style={{ color: "#f87171" }}>
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" onClick={closeMobile}>Login</Link>
            <Link to="/register" onClick={closeMobile}>Register</Link>
          </>
        )}
      </div>
    </>
  );
}

