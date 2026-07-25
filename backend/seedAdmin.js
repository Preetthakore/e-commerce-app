// Run once to create your first admin account:
//   node seedAdmin.js
// Since /api/auth/register blocks self-signup as admin (by design),
// this script is the way to create the initial admin.
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const email = "admin@example.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash("Admin@123", 10);
  await User.create({ name: "Admin", email, password: hashed, role: "admin" });
  console.log("Admin created -> email: admin@example.com | password: Admin@123");
  process.exit(0);
};

run();
