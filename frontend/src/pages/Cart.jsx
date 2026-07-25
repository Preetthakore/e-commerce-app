import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQty = async (productId, delta) => {
    const item = cart.items.find((i) => String(i.product._id) === String(productId));
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try {
      await api.put(`/cart/${productId}`, { quantity: newQty });
      fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      toast.success("Item removed from cart");
      fetchCart();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleCheckout = async () => {
    try {
      const { data } = await api.post("/orders/create-razorpay-order");

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ShopEasy",
        description: "Order Payment",
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post("/orders/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful! Order placed.");
            navigate("/orders");
          } catch {
            toast.error("Payment verification failed.");
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Failed to initiate checkout");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Cart</h2>
        <div className="loading-center">
          <div className="spinner dark" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <h2>Cart</h2>
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
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
        <h2>Shopping Cart ({cart.items.length} items)</h2>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((i) => (
            <div className="cart-item" key={i.product._id}>
              <img src={i.product.imageUrl} alt={i.product.name} />
              <div className="item-info">
                <strong>{i.product.name}</strong>
                <span className="item-price">
                  ₹{i.product.price} each
                </span>
              </div>
              <div className="qty-controls">
                <button onClick={() => updateQty(i.product._id, -1)}>−</button>
                <span>{i.quantity}</span>
                <button onClick={() => updateQty(i.product._id, 1)}>+</button>
              </div>
              <div style={{ fontWeight: 700, minWidth: 80, textAlign: "right" }}>
                ₹{i.product.price * i.quantity}
              </div>
              <button className="icon-btn" onClick={() => removeItem(i.product._id)} title="Remove item">
                🗑
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.items.length} items)</span>
            <span>₹{total}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="text-muted">Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button className="primary checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

