import mongoose from "mongoose";
import { Product } from "../data/interfaces";

const pricesSchema = new mongoose.Schema(
  {
    cost: { type: Number, required: false, default: 0 },
    priceRetail: { type: Number, required: false, default: 0 },
    priceWholesale: { type: Number, required: false, default: 0 },
  },
  { _id: false },
);

const ProductProfitPercents = new mongoose.Schema(
  {
    retail: { type: Number, required: false, default: 0 },
    wholesale: { type: Number, required: false, default: 0 },
  },
  { _id: false },
);

const ImageSchema = new mongoose.Schema({
  name: { type: String, required: false, default: "" },
  url: { type: String, required: false, default: "" },
  alt: { type: String, required: false, default: "" },
  altEN: { type: String, required: false, default: "" },
});

const AditionalSchema = new mongoose.Schema(
  {
    show: { type: Boolean, required: false, default: false },
    description: { type: String, required: false, default: "" },
    descriptionEn: { type: String, required: false, default: "" },
    seoTitle: { type: String, required: false, default: "" },
    seoTitleEn: { type: String, required: false, default: "" },
    seoDescription: { type: String, required: false, default: "" },
    seoDescriptionEn: { type: String, required: false, default: "" },
    images: { type: [ImageSchema], required: false, default: [] },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema<Product>({
  name: { type: String, required: false },
  category: { type: String, required: false, default: "Kita" },
  prices: pricesSchema,
  profit: ProductProfitPercents,
  aditional: AditionalSchema,
});

export default mongoose.model("products", productSchema, "products");
