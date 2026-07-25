import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ManageProducts() {
  const { user } = useAuth();
  const toast = useToast();
  const [myProducts, setMyProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", stock: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMine = async () => {
    try {
      const res = await api.get("/products", { params: { limit: 100 } });
      const mine = user.role === "admin" ? res.data.products : res.data.products.filter((p) => p.owner === user.id);
      setMyProducts(mine);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "", stock: "" });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setError("");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append("image", imageFile);

      if (editingId) {
        await api.put(`/products/${editingId}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product updated!");
      } else {
        if (!imageFile) {
          setError("Image is required for new products");
          setSaving(false);
          return;
        }
        await api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product created!");
      }
      resetForm();
      fetchMine();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock });
    setImagePreview(p.imageUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchMine();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="container">
      <div className="form-card wide">
        <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              placeholder="Enter product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe your product..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                placeholder="0"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                placeholder="e.g. Electronics"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              placeholder="0"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            )}
          </div>
          {error && <p className="error">✕ {error}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary" type="submit" disabled={saving} style={{ flex: 1, justifyContent: "center", padding: "12px" }}>
              {saving ? (
                <span className="spinner" />
              ) : editingId ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="mt-32">My Products</h2>
      {loading ? (
        <div className="loading-center">
          <div className="spinner dark" style={{ width: 32, height: 32 }} />
        </div>
      ) : myProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No products yet</h3>
          <p>Create your first product above.</p>
        </div>
      ) : (
        <div className="grid mt-16">
          {myProducts.map((p) => (
            <div className="card" key={p._id}>
              <img src={p.imageUrl} alt={p.name} />
              <div className="body">
                <h3>{p.name}</h3>
                <p className="price">₹{p.price}</p>
                {p.category && <span className="category-tag">{p.category}</span>}
                <div className="actions">
                  <button className="secondary" onClick={() => handleEdit(p)}>
                    Edit
                  </button>
                  <button className="danger" onClick={() => handleDelete(p._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

