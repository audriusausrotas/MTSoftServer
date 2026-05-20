import mongoose, { Types } from "mongoose";
import {
  Client,
  Creator,
  Dates,
  Project,
  Result,
  Works,
  Comment,
  Version,
  Gate,
  Fence,
  Measure,
} from "../data/interfaces";

const resultSchema = new mongoose.Schema<Result>(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    category: { type: String, default: "" },
    quantity: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    twoSided: { type: String, default: "Ne" },
    direction: { type: String, default: "Horizontali" },
    seeThrough: { type: String, default: "" },
    space: { type: Number, default: 0 },
    color: { type: String, default: "" },
    totalPrice: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
    width: { type: Number, default: null },
    delivered: { type: Boolean, default: false },
    ordered: { type: Boolean, default: false },
    retail: { type: Boolean, default: false },
    units: { type: Boolean, default: false },
    material: { type: String, default: "" },
    manufacturer: { type: String, default: "" },
    auto: { type: String, required: false, default: "Taip" },
    lock: { type: String, required: false, default: "Inox" },
    installation: { type: String, required: false, default: "Taip" },
  },
  { _id: false },
);

const workSchema = new mongoose.Schema<Works>(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
    done: { type: Boolean, default: false },
    retail: { type: Boolean, default: false },
  },
  { _id: false },
);

const datesSchema = new mongoose.Schema<Dates>(
  {
    dateCreated: { type: String, required: false, default: "" },
    dateExparation: { type: String, required: false, default: "" },
    dateConfirmed: { type: String, required: false, default: "" },
    dateCompletion: { type: String, required: false, default: "" },
    dateArchieved: { type: String, required: false, default: "" },
  },
  { _id: false },
);

const creatorSchema = new mongoose.Schema<Creator>(
  {
    username: { type: String, required: false, default: "" },
    lastName: { type: String, required: false, default: "" },
    email: { type: String, required: false, default: "" },
    phone: { type: String, required: false, default: "" },
  },
  { _id: false },
);

const clientSchema = new mongoose.Schema<Client>(
  {
    username: { type: String, required: false, default: "" },
    address: { type: String, required: false, default: "" },
    email: { type: String, required: false, default: "" },
    phone: { type: String, required: false, default: "" },
  },
  { _id: false },
);

const commentSchema = new mongoose.Schema<Comment>(
  {
    date: { type: String, required: false, default: "" },
    creator: { type: String, required: false, default: "" },
    comment: { type: String, required: false, default: "" },
  },
  { _id: false },
);

const versionSchema = new mongoose.Schema<Version>(
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    date: { type: String, required: false, default: "" },
  },
  { _id: false },
);

const gateSchema = new mongoose.Schema<Gate>(
  {
    name: { type: String, required: false, default: "" },
    auto: { type: String, required: false, default: "" },
    width: { type: Number, required: false, default: 0 },
    height: { type: Number, required: false, default: 0 },
    color: { type: String, required: false, default: "" },
    filling: { type: String, required: false, default: "" },
    ready: { type: Boolean, required: false, default: false },
    bankette: { type: String, required: false, default: "" },
    direction: { type: String, required: false, default: "" },
    lock: { type: String, required: false, default: "" },
    comment: { type: String, required: false, default: "" },
    option: { type: String, required: false, default: "" },
    installation: { type: String, required: false, default: "" },
  },
  { _id: false },
);

const measureSchema = new mongoose.Schema<Measure>(
  {
    length: { type: Number, required: false, default: 0 },
    height: { type: Number, required: false, default: 0 },
    MeasureSpace: { type: Number, required: false, default: 0 },
    elements: { type: Number, required: false, default: 0 },
    gates: { type: Object, required: false, default: {} },
    kampas: {
      exist: { type: Boolean, required: false, default: false },
      value: { type: Number, required: false, default: 0 },
      comment: { type: String, required: false, default: "" },
    },
    laiptas: {
      exist: { type: Boolean, required: false, default: false },
      value: { type: Number, required: false, default: 0 },
      direction: { type: String, required: false, default: "" },
    },
  },
  { _id: false },
);

const fenceSchema = new mongoose.Schema<Fence>(
  {
    id: { type: String, required: false, default: "" },
    side: { type: String, required: false, default: "" },
    name: { type: String, required: false, default: "" },
    color: { type: String, required: false, default: "" },
    material: { type: String, required: false, default: "" },
    manufacturer: { type: String, required: false, default: "" },
    services: { type: String, required: false, default: "" },
    seeThrough: { type: String, required: false, default: "" },
    direction: { type: String, required: false, default: "" },
    holes: { type: String, required: false, default: "" },
    parts: { type: String, required: false, default: "" },
    comment: { type: String, required: false, default: "" },
    twoSided: { type: String, required: false, default: "" },
    bindings: { type: String, required: false, default: "" },
    anchoredPoles: { type: String, required: false, default: "" },
    space: { type: Number, required: false, default: 0 },
    elements: { type: Number, required: false, default: 0 },
    totalLength: { type: Number, required: false, default: 0 },
    totalQuantity: { type: Number, required: false, default: 0 },
    measures: { type: [measureSchema], required: false, default: [] },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema<Project>({
  client: {
    type: clientSchema,
    required: false,
    default: {},
  },
  fenceMeasures: {
    type: [fenceSchema],
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
    type: [gateSchema],
    required: false,
    default: [],
  },
  gateManufacturer: {
    type: String,
    required: false,
    default: "",
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
    type: [commentSchema],
    required: false,
    default: [],
  },
  versions: {
    type: [versionSchema],
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
    default: 0,
  },
  totalCost: {
    type: Number,
    required: false,
    default: 0,
  },
  totalProfit: {
    type: Number,
    required: false,
    default: 0,
  },
  totalMargin: {
    type: Number,
    required: false,
    default: 0,
  },
  priceVAT: {
    type: Number,
    required: false,
    default: 0,
  },
  priceWithDiscount: {
    type: Number,
    required: false,
    default: 0,
  },
  retail: {
    type: Boolean,
    required: false,
    default: false,
  },
  discount: {
    type: Boolean,
    required: false,
    default: false,
  },
  dates: { type: datesSchema, default: {} },
  creator: { type: creatorSchema, default: {} },
  orderNumber: {
    type: String,
    required: false,
    default: "",
  },
});

export default mongoose.model("projects", projectSchema, "projects");
