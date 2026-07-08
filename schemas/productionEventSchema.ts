import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  lastName: { type: String, required: false, default: "" },
  email: { type: String, required: true },
});

const productionEventSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true },
  timestamp: { type: Date, required: false, default: Date.now },
  user: { type: userSchema, required: true },
  machine: { type: String, required: false, default: "Nepasirinkta" },
  holeInformation: { type: String, required: false, default: "" },
  operation: { type: String, required: false, default: "" },
  element: {
    name: { type: String, required: false, default: "" },
    quantity: { type: Number, required: false, default: 0 },
    holesCount: { type: Number, required: false, default: 0 },
    length: { type: Number, required: false, default: 0 },
    location: {
      index: { type: Number, required: true },
      measureIndex: { type: Number, required: false, default: null },
    },
  },
});

export default mongoose.model("productionEvent", productionEventSchema, "productionEvent");
