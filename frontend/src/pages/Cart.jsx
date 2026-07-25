import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchCart = async () => {
    const res = await api.get("/cart");
    setCart(res.data);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return;
    await api.put(`/cart/${productId}`, { quantity });
    await fetchCart();
    await refreshCart();
  };

  const removeItem = async (productId) => {
    await api.delete(`/cart/${productId}`);
    await fetchCart();
    await refreshCart();
  };

  const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleCheckout = async () => {
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
          await refreshCart();
          showToast("Payment successful! Order placed.", "success");
          navigate("/orders");
        } catch (err) {
          showToast("Payment verification failed.", "error");
        }
      },
      prefill: { name: user?.name, email: user?.email },
      theme: { color: "#4f46e5" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="page-header"><h2>Cart</h2></div>
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started.</p>
          <button className="primary" onClick={() => navigate("/products")}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header"><h2>Cart</h2></div>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((i) => (
            <div key={i.product._id} className="cart-item">
              <img src={i.product.imageUrl} alt={i.product.name} />
              <div className="item-info">
                <strong>{i.product.name}</strong>
                <div className="item-price">₹{i.product.price} each</div>
              </div>
              <div className="qty-controls">
                <button onClick={() => updateQty(i.product._id, i.quantity - 1)}>−</button>
                <span>{i.quantity}</span>
                <button onClick={() => updateQty(i.product._id, i.quantity + 1)}>+</button>
              </div>
              <button className="danger" onClick={() => removeItem(i.product._id)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items</span>
            <span>{cart.items.reduce((s, i) => s + i.quantity, 0)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button className="primary checkout-btn" onClick={handleCheckout}>Checkout with Razorpay</button>
        </div>
      </div>
    </div>
  );
}