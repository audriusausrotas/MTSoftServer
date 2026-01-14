import mongoose from "mongoose";
import { Project } from "../data/interfaces";

const archiveSchema = new mongoose.Schema<Project>({
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
  workers: {
    type: [String],
    required: false,
    default: [],
  },
  comments: {
    type: [Object],
    required: false,
    default: [],
  },
  gateManufacturer: {
    type: String,
    required: false,
    default: "",
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
  totalPrice: Number,
  totalCost: Number,
  totalProfit: Number,
  totalMargin: Number,
  priceVAT: Number,
  priceWithDiscount: Number,
  discount: Boolean,
});

export default mongoose.model("projectsArchived", archiveSchema, "projectsArchived");
