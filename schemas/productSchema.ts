import mongoose from "mongoose";
import { Product } from "../data/interfaces";

const seeThroughSchema = new mongoose.Schema({
  Aklina: { space: Number, price: Number, cost: Number },
  Nepramatoma: { space: Number, price: Number, cost: Number },
  Vidutiniška: { space: Number, price: Number, cost: Number },
  Pramatoma: { space: Number, price: Number, cost: Number },
  "25% Pramatomumas": { space: Number, price: Number, cost: Number },
  "50% Pramatomumas": { space: Number, price: Number, cost: Number },
});

const productSchema = new mongoose.Schema<Product>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true, default: 0 },
  category: { type: String, required: true, default: "Kita" },
  image: { type: String, required: true },
  height: { type: Number, required: true },
  width: { type: Number, required: true },
  isFenceBoard: { type: Boolean, required: true },
  defaultDirection: { type: String, required: true },
  seeThrough: { type: seeThroughSchema, required: true },
});

export default mongoose.model("products", productSchema, "products");
