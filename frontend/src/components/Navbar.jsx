import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const doLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const links = (
    <>
      <Link to="/products" onClick={() => setMobileOpen(false)}>Products</Link>
      {user?.role === "user" && (
        <Link to="/cart" className="cart-badge" onClick={() => setMobileOpen(false)}>
          Cart {count > 0 && <span className="badge">{count}</span>}
        </Link>
      )}
      {user?.role === "user" && <Link to="/wishlist" onClick={() => setMobileOpen(false)}>Wishlist</Link>}
      {user?.role === "user" && <Link to="/orders" onClick={() => setMobileOpen(false)}>My Orders</Link>}
      {(user?.role === "admin" || user?.role === "sales_person") && (
        <Link to="/manage-products" onClick={() => setMobileOpen(false)}>Add Product</Link>
      )}
      {user?.role === "sales_person" && <Link to="/seller-orders" onClick={() => setMobileOpen(false)}>Seller Orders</Link>}
      {user?.role === "admin" && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
      {!user && <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>}
      {!user && <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>}
      {user && <button onClick={doLogout}>Logout ({user.name})</button>}
    </>
  );

  return (
    <>
      <nav>
        <Link to="/" className="brand">ShopEasy</Link>
        <div className="links">{links}</div>
        <button
          className={`hamburger ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}>{links}</div>
    </>
  );
}