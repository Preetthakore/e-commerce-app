import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const toast = useToast();

  const fetchProducts = async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12 };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await api.get("/products", { params });
      setProducts(res.data.products);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1);
  };

  const addToCart = async (productId) => {
    if (!user) return toast.error("Please login to add items to cart");
    try {
      await api.post("/cart", { productId, quantity: 1 });
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) return toast.error("Please login to use wishlist");
    try {
      await api.post(`/wishlist/${productId}`);
      toast.success("Added to wishlist!");
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  // Skeleton loading cards
  if (loading) {
    return (
      <div className="container">
        <div className="page-header">
          <h2>Products</h2>
        </div>
        <div className="filters">
          <div className="skeleton" style={{ height: 40, width: 180 }} />
          <div className="skeleton" style={{ height: 40, width: 140 }} />
          <div className="skeleton" style={{ height: 40, width: 100 }} />
          <div className="skeleton" style={{ height: 40, width: 100 }} />
          <div className="skeleton" style={{ height: 40, width: 80 }} />
        </div>
        <div className="grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton skeleton-img" />
              <div className="skeleton-body">
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
                <div className="skeleton skeleton-line medium" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Products</h2>
      </div>

      <form className="filters" onSubmit={handleSearch}>
        <input
          placeholder="Search products..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          placeholder="Min price"
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          placeholder="Max price"
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button className="primary" type="submit">
          Search
        </button>
        {(keyword || category || minPrice || maxPrice) && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setKeyword("");
              setCategory("");
              setMinPrice("");
              setMaxPrice("");
              setPage(1);
              fetchProducts(1);
            }}
          >
            Clear
          </button>
        )}
      </form>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {products.map((p) => (
              <div className="card" key={p._id}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <img src={p.imageUrl} alt={p.name} />
                  {p.stock <= 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: "rgba(220,38,38,0.9)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 9999,
                      }}
                    >
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="body">
                  <h3>{p.name}</h3>
                  <p className="price">₹{p.price}</p>
                  <div>
                    <span className="category-tag">{p.category}</span>
                    {p.stock > 0 && (
                      <span className="stock-badge in-stock">{p.stock} in stock</span>
                    )}
                  </div>
                  <div className="actions">
                    <button
                      className="primary"
                      onClick={() => addToCart(p._id)}
                      disabled={p.stock <= 0}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="wishlist-btn"
                      onClick={() => addToWishlist(p._id)}
                      title="Add to wishlist"
                    >
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setPage(page - 1);
                  fetchProducts(page - 1);
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={page === p ? "active" : ""}
                  onClick={() => {
                    setPage(p);
                    fetchProducts(p);
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  setPage(page + 1);
                  fetchProducts(page + 1);
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

