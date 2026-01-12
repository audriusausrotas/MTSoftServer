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
  name: { type: String, required: false, default: "" },
  length: { type: Number, required: false, default: 0 },
  height: { type: Number, required: false, default: 0 },
  category: {
    type: String,
    enum: ["varstomi", "stumdomi", "varteliai", "segmentiniai"],
    required: false,
    default: "",
  },
  profit: { type: profitSchema, required: false, default: 0 },
  prices: { type: pricesSchema, required: false, default: 0 },
});

export default mongoose.model("gatePrices", gateSchema, "gatePrices");
