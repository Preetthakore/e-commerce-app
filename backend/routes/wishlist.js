import express from "express";
import Wishlist from "../models/Wishlist.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, authorize("user"), async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  res.json(wishlist);
});

router.post("/:productId", protect, authorize("user"), async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

  if (!wishlist.products.map(String).includes(req.params.productId)) {
    wishlist.products.push(req.params.productId);
    await wishlist.save();
  }
  await wishlist.populate("products");
  res.json(wishlist);
});

router.delete("/:productId", protect, authorize("user"), async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });
  wishlist.products = wishlist.products.filter((p) => String(p) !== req.params.productId);
  await wishlist.save();
  await wishlist.populate("products");
  res.json(wishlist);
});

export default router;