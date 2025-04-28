import mongoose from "mongoose";
import { Project } from "../data/interfaces";

const unconfirmedSchema = new mongoose.Schema<Project>({
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

export default mongoose.model("projectsUnconfirmed", unconfirmedSchema, "projectsUnconfirmed");
