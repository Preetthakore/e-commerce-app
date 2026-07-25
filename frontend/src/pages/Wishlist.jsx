import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState({ products: [] });
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    const res = await api.get("/wishlist");
    setWishlist(res.data);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const remove = async (id) => {
    await api.delete(`/wishlist/${id}`);
    fetchWishlist();
  };

  const addToCart = async (id, name) => {
    await api.post("/cart", { productId: id, quantity: 1 });
    await refreshCart();
    showToast(`${name} added to cart`, "success");
  };

  return (
    <div className="container">
      <div className="page-header"><h2>Wishlist</h2></div>
      {wishlist.products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">♡</div>
          <h3>Your wishlist is empty</h3>
          <p>Save products you love for later.</p>
          <button className="primary" onClick={() => navigate("/products")}>Browse Products</button>
        </div>
      ) : (
        <div className="grid">
          {wishlist.products.map((p) => (
            <div className="card" key={p._id}>
              <img src={p.imageUrl} alt={p.name} />
              <div className="body">
                <h3>{p.name}</h3>
                <div className="price">₹{p.price}</div>
                <div className="actions">
                  <button className="primary" onClick={() => addToCart(p._id, p.name)}>Add to Cart</button>
                  <button className="danger" onClick={() => remove(p._id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}