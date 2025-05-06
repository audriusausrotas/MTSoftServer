import mongoose from "mongoose";
import { Project } from "../data/interfaces";

const resultSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String },
  price: { type: Number },
  cost: { type: Number },
  category: { type: String },
  quantity: { type: Number },
  height: { type: Number },
  twoSided: { type: String },
  direction: { type: String },
  seeThrough: { type: String },
  space: { type: Number },
  color: { type: String },
  totalPrice: { type: Number },
  totalCost: { type: Number },
  profit: { type: Number },
  margin: { type: Number },
  width: { type: Number, default: null },
  delivered: { type: Boolean, default: false },
  ordered: { type: Boolean, default: false },
});

const workSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  price: { type: Number },
  cost: { type: Number },
  quantity: { type: Number },
  totalPrice: { type: Number },
  totalCost: { type: Number },
  profit: { type: Number },
  margin: { type: Number },
  done: { type: Boolean, default: false },
});

const datesSchema = new mongoose.Schema({
  dateCreated: { type: String, required: false },
  dateExparation: { type: String, required: false },
  dateConfirmed: { type: String, required: false },
  dateCompletion: { type: String, required: false },
  dateArchieved: { type: String, required: false },
});

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
    type: [resultSchema],
    required: false,
    default: [],
  },
  works: {
    type: [workSchema],
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
    type: datesSchema,
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
