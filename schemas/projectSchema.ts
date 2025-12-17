import mongoose from "mongoose";
import { Creator, Dates, Project, Result, Works } from "../data/interfaces";

const resultSchema = new mongoose.Schema<Result>(
  {
    id: { type: String, required: true },
    name: { type: String },
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
    retail: { type: Boolean, default: true },
    units: { type: Boolean, default: true },
    material: { type: String },
    manufacturer: { type: String },
  },
  { _id: false }
);

const workSchema = new mongoose.Schema<Works>(
  {
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
    retail: { type: Boolean, default: true },
  },
  { _id: false }
);

const datesSchema = new mongoose.Schema<Dates>(
  {
    dateCreated: { type: String, required: false },
    dateExparation: { type: String, required: false },
    dateConfirmed: { type: String, required: false },
    dateCompletion: { type: String, required: false },
    dateArchieved: { type: String, required: false },
  },
  { _id: false }
);

const creatorSchema = new mongoose.Schema<Creator>(
  {
    username: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
  },
  { _id: false }
);

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
  creator: creatorSchema,
  orderNumber: String,
});

export default mongoose.model("projects", projectSchema, "projects");
