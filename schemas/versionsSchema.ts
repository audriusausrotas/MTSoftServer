import mongoose from "mongoose";
import { Project } from "../data/interfaces";

const versionsSchema = new mongoose.Schema<Project>({
  client: {
    type: Object,
    required: false,
    default: {},
  },
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
  versions: {
    type: [Object],
    required: false,
    default: [],
  },
  creator: Object,
  orderNumber: String,
  totalPrice: Number,
  totalCost: Number,
  totalProfit: Number,
  totalMargin: Number,
  priceVAT: Number,
  priceWithDiscount: Number,
  discount: Boolean,
  dateCreated: String,
  dateExparation: String,
});

export default mongoose.model("projectsVersions", versionsSchema, "projectsVersions");
