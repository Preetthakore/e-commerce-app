import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route GET /api/users (admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// @route POST /api/users (admin only)
// Lets an admin directly create a Sales Person (or another Admin) account,
// since those roles are not available through public self-registration.
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password required" });
    }
    if (!["sales_person", "admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role });

    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/users/:id/role (admin only)
router.put("/:id/role", protect, authorize("admin"), async (req, res) => {
  const { role } = req.body;
  if (!["admin", "sales_person", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;