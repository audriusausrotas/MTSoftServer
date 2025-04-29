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
  name: { type: String, required: false },
  price: { type: Number, required: false },
  cost: { type: Number, required: false, default: 0 },
  category: { type: String, required: false, default: "Kita" },
  image: { type: String, required: false },
  height: { type: Number, required: false },
  width: { type: Number, required: false },
  isFenceBoard: { type: Boolean, required: false },
  defaultDirection: { type: String, required: false },
  seeThrough: { type: seeThroughSchema, required: false },
});

export default mongoose.model("products", productSchema, "products");
