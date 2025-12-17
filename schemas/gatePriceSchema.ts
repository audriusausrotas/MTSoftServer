import mongoose from "mongoose";

const profitSchema = new mongoose.Schema(
  {
    retail: { type: Number, default: 0 },
    wholesale: { type: Number, default: 0 },
  },
  { _id: false }
);

const priceBlockSchema = new mongoose.Schema(
  {
    frame: { type: Number, default: 0 },
    automation: { type: Number, default: 0 },
    installation: { type: Number, default: 0 },
    inox: { type: Number, default: 0 },
    locinox: { type: Number, default: 0 },
    iseo_el: { type: Number, default: 0 },
    locinox_el: { type: Number, default: 0 },
  },
  { _id: false }
);

const pricesSchema = new mongoose.Schema(
  {
    cost: { type: priceBlockSchema, default: {} },
    priceRetail: { type: priceBlockSchema, default: {} },
    priceWholesale: { type: priceBlockSchema, default: {} },
  },
  { _id: false }
);

const gateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  length: { type: Number, required: true },
  category: {
    type: String,
    enum: ["varstomi", "stumdomi", "varteliai"],
    required: true,
  },
  profit: { type: profitSchema, required: true },
  prices: { type: pricesSchema, required: true },
});

export default mongoose.model("gatePrices", gateSchema, "gatePrices");
