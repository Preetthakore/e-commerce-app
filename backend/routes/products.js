import express from "express";
import multer from "multer";
import Product from "../models/Product.js";
import { protect, authorize } from "../middleware/auth.js";
import { storage } from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage });

// @route GET /api/products  (public - list/search/filter)
router.get("/", async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (keyword) filter.$text = { $search: keyword };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/products/:id (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/products (admin, sales_person)
router.post("/", protect, authorize("admin", "sales_person"), upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    if (!req.file) return res.status(400).json({ message: "Product image is required" });

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      imageUrl: req.file.path, // Cloudinary secure URL
      owner: req.user._id,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/products/:id (admin: any product; sales_person: own only)
router.put("/:id", protect, authorize("admin", "sales_person"), upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Enforced server-side: sales_person can only edit their own products
    if (req.user.role === "sales_person" && String(product.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own products" });
    }

    const { name, description, price, category, stock } = req.body;
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (req.file) product.imageUrl = req.file.path;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/products/:id (admin: any; sales_person: own only)
router.delete("/:id", protect, authorize("admin", "sales_person"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.user.role === "sales_person" && String(product.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
