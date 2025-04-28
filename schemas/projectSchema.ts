import mongoose from "mongoose";
import { Project } from "../data/interfaces";

const projectSchema = new mongoose.Schema<Project>({
  client: {
    type: Object,
    required: true,
    default: {},
  },
  retail: Boolean,
  fenceMeasures: {
    type: [Object],
    required: true,
    default: [],
  },
  results: {
    type: [Object],
    required: true,
    default: [],
  },
  works: {
    type: [Object],
    required: true,
    default: [],
  },
  gates: {
    type: [Object],
    required: true,
    default: [],
  },

  advance: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    default: "Nepatvirtintas",
  },
  files: {
    type: [String],
    required: true,
    default: [],
  },
  comments: {
    type: [Object],
    required: true,
    default: [],
  },
  versions: {
    type: [Object],
    required: true,
    default: [],
  },
  workers: {
    type: [String],
    required: true,
    default: [],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  totalProfit: {
    type: Number,
    required: true,
  },
  totalMargin: {
    type: Number,
    required: true,
  },
  priceVAT: {
    type: Number,
    required: true,
  },
  priceWithDiscount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Boolean,
    required: true,
  },
  dates: {
    type: Object,
    required: true,
    default: {
      dateCreated: "",
      dateExparation: "",
      dateConfirmed: "",
      dateCompletion: "",
      dateArchieved: "",
    },
  },
  creator: Object,
  orderNumber: String,
});

export default mongoose.model("projects", projectSchema, "projects");
