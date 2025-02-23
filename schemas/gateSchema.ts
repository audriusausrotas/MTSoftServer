import mongoose from "mongoose";
import { GateSchema } from "../data/interfaces";

const gateSchema = new mongoose.Schema<GateSchema>({
  _id: Object,
  client: Object,
  creator: Object,
  manager: String,
  orderNr: {
    type: String,
    required: false,
    default: "",
  },
  comments: {
    type: [Object],
    required: false,
    default: [],
  },
  measure: {
    type: String,
    required: false,
    default: "Eilėje",
  },
  gates: [Object],
  dateCreated: String,
});

export default mongoose.model("gates", gateSchema);
