import mongoose from "mongoose";
import { FenceSetup } from "../data/interfaces";

const detailsSchema = new mongoose.Schema({
  width: { type: Number, required: true, default: 0 },
  height: { type: Number, required: true, default: 0 },
  bends: { type: Number, required: true, default: 0 },
  holes: { type: Number, required: true, default: 8 },
});

const seeThroughSchema = new mongoose.Schema({
  aklina: { type: Number, required: true, default: 0 },
  nepramatoma: { type: Number, required: true, default: 0 },
  vidutiniska: { type: Number, required: true, default: 0 },
  pramatoma: { type: Number, required: true, default: 0 },
  pramatoma25: { type: Number, required: true, default: 0 },
  pramatoma50: { type: Number, required: true, default: 0 },
});

const seeThroughPriceSchema = new mongoose.Schema({
  cost: { type: Number, required: true, default: 0 },
  priceRetail: { type: Number, required: true, default: 0 },
  priceWholesale: { type: Number, required: true, default: 0 },
});

const qualitySchema = new mongoose.Schema({
  meter: seeThroughPriceSchema,
  aklina: seeThroughPriceSchema,
  vidutiniska: seeThroughPriceSchema,
  pramatoma: seeThroughPriceSchema,
  nepramatoma: seeThroughPriceSchema,
  pramatoma25: seeThroughPriceSchema,
  pramatoma50: seeThroughPriceSchema,
});

const priceSchema = new mongoose.Schema({
  premium: qualitySchema,
  eco: qualitySchema,
});

const fenceSchema = new mongoose.Schema<FenceSetup>({
  name: { type: String, required: true, default: "" },
  type: { type: String, required: true, default: "Tvora" },
  defaultDirection: { type: String, required: true, default: "Horizontali" },
  details: detailsSchema,
  steps: seeThroughSchema,
  prices: priceSchema,
});

export default mongoose.model("fences", fenceSchema, "fences");
