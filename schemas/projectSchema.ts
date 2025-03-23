import mongoose from "mongoose";
import { Project } from "../data/interfaces";

const projectSchema = new mongoose.Schema<Project>({
  client: {
    type: Object,
    required: false,
    default: {},
  },
  retail: Boolean,
  fenceMeasures: {
    type: [Object],
    required: false,
    default: [],
  },
  results: {
    type: [Object],
    required: false,
    default: [],
  },
  works: {
    type: [Object],
    required: false,
    default: [],
  },
  gates: {
    type: [Object],
    required: false,
    default: [],
  },

  advance: {
    type: Number,
    required: false,
    default: 0,
  },
  status: {
    type: String,
    required: false,
    default: "Nepatvirtintas",
  },
  files: {
    type: [String],
    required: false,
    default: [],
  },
  comments: {
    type: [Object],
    required: false,
    default: [],
  },
  versions: {
    type: [Object],
    required: false,
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
  creator: Object,
  orderNumber: String,
  dateCreated: String,
  dateExparation: String,
});

export default mongoose.model("projects", projectSchema, "projects");
