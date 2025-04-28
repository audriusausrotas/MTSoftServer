import mongoose from "mongoose";
import { GateSchema } from "../data/interfaces";

const gateSchema = new mongoose.Schema<GateSchema>({
  client: Object,
  creator: Object,
  manager: String,
  orderNr: {
    type: String,
    required: true,
    default: "",
  },
  comments: {
    type: [Object],
    required: true,
    default: [],
  },
  measure: {
    type: String,
    required: true,
    default: "Eilėje",
  },
  gates: [Object],
  dateCreated: String,
});

export default mongoose.model("gates", gateSchema, "gates");
