import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ManageProducts() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [myProducts, setMyProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", stock: "" });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchMine = async () => {
    const res = await api.get("/products", { params: { limit: 100 } });
    const mine = user.role === "admin" ? res.data.products : res.data.products.filter((p) => p.owner === user.id);
    setMyProducts(mine);
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "", stock: "" });
    setImageFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append("image", imageFile);

      if (editingId) {
        await api.put(`/products/${editingId}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        showToast("Product updated", "success");
      } else {
        if (!imageFile) return setError("Image is required for new products");
        await api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } });
        showToast("Product created", "success");
      }
      resetForm();
      fetchMine();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    showToast("Product deleted", "info");
    fetchMine();
  };

  return (
    <div className="container">
      <div className="form-card wide">
        <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Price (₹)</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Product Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="flex gap-8">
            <button className="primary" type="submit">{editingId ? "Update" : "Create"}</button>
            {editingId && <button type="button" className="secondary" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="page-header mt-32">
        <h2>My Products</h2>
      </div>
      {myProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No products yet</h3>
          <p>Create your first product using the form above.</p>
        </div>
      ) : (
        <div className="grid">
          {myProducts.map((p) => (
            <div className="card" key={p._id}>
              <img src={p.imageUrl} alt={p.name} />
              <div className="body">
                <h3>{p.name}</h3>
                <div className="price">₹{p.price}</div>
                <div className="actions">
                  <button className="secondary" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}