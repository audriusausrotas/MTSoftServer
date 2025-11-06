import mongoose from "mongoose";
import { Product } from "../data/interfaces";

const pricesSchema = new mongoose.Schema({
  cost: { type: Number, required: false, default: 0 },
  priceRetail: { type: Number, required: false, default: 0 },
  priceWholesale: { type: Number, required: false, default: 0 },
});

const productSchema = new mongoose.Schema<Product>({
  name: { type: String, required: false },
  category: { type: String, required: false, default: "Kita" },
  prices: { type: pricesSchema, required: false },
});

export default mongoose.model("products", productSchema, "products");
