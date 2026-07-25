import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route POST /api/orders/create-razorpay-order
// Creates a Razorpay order for the current cart total. Amount is computed
// server-side from DB prices, never trusted from the client.
router.post("/create-razorpay-order", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/orders/verify
// Verifies the Razorpay payment signature, then creates the Order record
// and clears the cart. This is what stops a fake "success" from the frontend
// alone counting as a real payment.
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      owner: i.product.owner,
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "paid",
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/orders/my  (user: own orders)
router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @route GET /api/orders/seller  (sales_person: orders containing their products)
router.get("/seller", protect, authorize("sales_person", "admin"), async (req, res) => {
  const orders = await Order.find({ "items.owner": req.user._id }).sort({ createdAt: -1 });
  // Only return the items belonging to this seller, not the whole order
  const filtered = orders.map((o) => ({
    _id: o._id,
    user: o.user,
    status: o.status,
    createdAt: o.createdAt,
    items: o.items.filter((i) => String(i.owner) === String(req.user._id)),
  }));
  res.json(filtered);
});

// @route GET /api/orders  (admin: all orders + stats)
router.get("/", protect, authorize("admin"), async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
  res.json(orders);
});

// @route GET /api/orders/stats  (admin: basic sales stats)
router.get("/stats", protect, authorize("admin"), async (req, res) => {
  const totalOrders = await Order.countDocuments({ status: "paid" });
  const revenueAgg = await Order.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
  ]);
  res.json({
    totalOrders,
    totalSales: revenueAgg[0]?.totalSales || 0,
  });
});

export default router;
