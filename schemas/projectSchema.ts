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
  workers: {
    type: [String],
    required: false,
    default: [],
  },
  totalPrice: {
    type: Number,
    required: false,
  },
  totalCost: {
    type: Number,
    required: false,
  },
  totalProfit: {
    type: Number,
    required: false,
  },
  totalMargin: {
    type: Number,
    required: false,
  },
  priceVAT: {
    type: Number,
    required: false,
  },
  priceWithDiscount: {
    type: Number,
    required: false,
  },
  discount: {
    type: Boolean,
    required: false,
  },
  dates: {
    type: Object,
    required: false,
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
