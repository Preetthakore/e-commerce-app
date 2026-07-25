import express from "express";
import Cart from "../models/Cart.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route GET /api/cart
router.get("/", protect, authorize("user"),async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json(cart);
});

// @route POST /api/cart  { productId, quantity }
router.post("/", protect, authorize("user"),async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existing = cart.items.find((i) => String(i.product) === String(productId));
  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

// @route PUT /api/cart/:productId  { quantity }
router.put("/:productId", protect,authorize("user"), async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find((i) => String(i.product) === String(req.params.productId));
  if (!item) return res.status(404).json({ message: "Item not in cart" });

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => String(i.product) !== String(req.params.productId));
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

// @route DELETE /api/cart/:productId
router.delete("/:productId", protect,authorize("user"), async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  cart.items = cart.items.filter((i) => String(i.product) !== String(req.params.productId));
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

export default router;
