import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      setWishlist(res.data);
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const addToCart = async (id) => {
    try {
      await api.post("/cart", { productId: id, quantity: 1 });
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Wishlist</h2>
        <div className="loading-center">
          <div className="spinner dark" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  if (wishlist.products.length === 0) {
    return (
      <div className="container">
        <h2>Wishlist</h2>
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to your wishlist.</p>
          <Link to="/" className="primary" style={{ display: "inline-block" }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Wishlist ({wishlist.products.length} items)</h2>
      </div>
      <div className="grid">
        {wishlist.products.map((p) => (
          <div className="card" key={p._id}>
            <img src={p.imageUrl} alt={p.name} />
            <div className="body">
              <h3>{p.name}</h3>
              <p className="price">₹{p.price}</p>
              {p.category && <span className="category-tag">{p.category}</span>}
              <div className="actions">
                <button className="primary" onClick={() => addToCart(p._id)}>
                  Add to Cart
                </button>
                <button className="danger" onClick={() => remove(p._id)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

