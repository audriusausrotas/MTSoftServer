import mongoose from "mongoose";
import { Product } from "../data/interfaces";

const pricesSchema = new mongoose.Schema({
  cost: { type: Number, required: false, default: 0 },
  priceRetail: { type: Number, required: false, default: 0 },
  priceWholesale: { type: Number, required: false, default: 0 },
});
const ProductProfitPercents = new mongoose.Schema({
  retail: { type: Number, required: false, default: 0 },
  wholesale: { type: Number, required: false, default: 0 },
});

const productSchema = new mongoose.Schema<Product>({
  name: { type: String, required: false },
  category: { type: String, required: false, default: "Kita" },
  prices: pricesSchema,
  profit: ProductProfitPercents,
});

export default mongoose.model("products", productSchema, "products");
