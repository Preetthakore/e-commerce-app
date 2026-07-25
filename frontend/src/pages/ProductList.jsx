import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();

  const fetchProducts = async () => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    const res = await api.get("/products", { params });
    setProducts(res.data.products);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = async (productId, name) => {
    if (!user) return showToast("Please login to add items to cart", "error");
    await api.post("/cart", { productId, quantity: 1 });
    await refreshCart();
    showToast(`${name} added to cart`, "success");
  };

  const addToWishlist = async (productId, name) => {
    if (!user) return showToast("Please login to use wishlist", "error");
    await api.post(`/wishlist/${productId}`);
    showToast(`${name} added to wishlist`, "success");
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>Everything you need, one cart away.</h1>
        <p>Browse products from trusted sellers, filter by category or price, and check out securely.</p>
        <button className="hero-cta" onClick={() => document.querySelector(".filters input")?.focus()}>
          Start Shopping
        </button>
      </div>

      <div className="page-header">
        <h2>Products</h2>
      </div>
      <div className="filters">
        <input placeholder="Search..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input placeholder="Min price" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input placeholder="Max price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <button className="primary" onClick={fetchProducts}>Search</button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛍️</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <div className="card" key={p._id}>
              <img src={p.imageUrl} alt={p.name} />
              <div className="body">
                <h3>{p.name}</h3>
                <div className="price">₹{p.price}</div>
                <span className="category-tag">{p.category}</span>
                <div className="actions">
                  <button className="primary" onClick={() => addToCart(p._id, p.name)}>Add to Cart</button>
                  <button className="wishlist-btn" onClick={() => addToWishlist(p._id, p.name)}>♡</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}