import mongoose from "mongoose";
import { FenceSetup } from "../data/interfaces";

const detailsSchema = new mongoose.Schema(
  {
    width: { type: Number, required: false, default: 0 },
    height: { type: Number, required: false, default: 0 },
    bends: { type: Number, required: false, default: 0 },
    holes: { type: Number, required: false, default: 8 },
  },
  { _id: false },
);

const seeThroughSchema = new mongoose.Schema(
  {
    aklina: { type: Number, required: false, default: 0 },
    nepramatoma: { type: Number, required: false, default: 0 },
    vidutiniska: { type: Number, required: false, default: 0 },
    pramatoma: { type: Number, required: false, default: 0 },
    pramatoma25: { type: Number, required: false, default: 0 },
    pramatoma50: { type: Number, required: false, default: 0 },
  },
  { _id: false },
);

const seeThroughPriceSchema = new mongoose.Schema(
  {
    cost: { type: Number, required: false, default: 0 },
    priceRetail: { type: Number, required: false, default: 0 },
    priceWholesale: { type: Number, required: false, default: 0 },
  },
  { _id: false },
);

const qualitySchema = new mongoose.Schema(
  {
    meter: seeThroughPriceSchema,
    aklina: seeThroughPriceSchema,
    vidutiniska: seeThroughPriceSchema,
    pramatoma: seeThroughPriceSchema,
    nepramatoma: seeThroughPriceSchema,
    pramatoma25: seeThroughPriceSchema,
    pramatoma50: seeThroughPriceSchema,
  },
  { _id: false },
);

const priceSchema = new mongoose.Schema(
  {
    cost: { type: Number, required: false, default: 0 },
    priceRetail: { type: Number, required: false, default: 0 },
    priceWholesale: { type: Number, required: false, default: 0 },
    premium: qualitySchema,
    eco: qualitySchema,
  },
  { _id: false },
);

const profitSchema = new mongoose.Schema(
  {
    premiumRetail: { type: Number, required: false, default: 0 },
    premiumWholesale: { type: Number, required: false, default: 0 },
    ecoRetail: { type: Number, required: false, default: 0 },
    ecoWholesale: { type: Number, required: false, default: 0 },
  },
  { _id: false },
);
const aditionalSchema = new mongoose.Schema(
  {
    show: { type: Boolean, required: false, default: false },
    description: { type: String, required: false, default: "" },
    descriptionEn: { type: String, required: false, default: "" },
    seoTitle: { type: String, required: false, default: "" },
    seoTitleEn: { type: String, required: false, default: "" },
    seoDescription: { type: String, required: false, default: "" },
    seoDescriptionEn: { type: String, required: false, default: "" },
    images: { type: [String], required: false, default: [] },
  },
  { _id: false },
);

const fenceSchema = new mongoose.Schema<FenceSetup>({
  name: { type: String, required: false, default: "" },
  category: { type: String, required: false, default: "Tvora" },
  defaultDirection: { type: String, required: false, default: "Horizontali" },
  details: detailsSchema,
  steps: seeThroughSchema,
  prices: priceSchema,
  profit: profitSchema,
  aditional: aditionalSchema,
});

export default mongoose.model("fences", fenceSchema, "fences");
