import express from "express";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @route GET /api/users (admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
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
