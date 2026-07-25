import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    stock: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);
