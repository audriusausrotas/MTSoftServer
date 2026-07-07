import mongoose from "mongoose";
import { Production, ProductionFence, ProductionMeasure, GateInfo } from "../data/interfaces";

const gatesSchema = new mongoose.Schema<GateInfo>(
  {
    exist: { type: Boolean, default: false },
    name: { type: String, default: "" },
    automatics: { type: String, default: "" },
    comment: { type: String, default: "" },
    direction: { type: String, default: "" },
    lock: { type: String, default: "" },
    bankette: { type: String, default: "" },
    option: { type: String, default: "" },
  },
  { _id: false },
);

const cornerSchema = new mongoose.Schema(
  {
    exist: { type: Boolean, default: false },
    value: { type: Number, default: 0 },
    comment: { type: String, default: "" },
  },
  { _id: false },
);

const stepSchema = new mongoose.Schema(
  {
    exist: { type: Boolean, default: false },
    value: { type: Number, default: 0 },
    direction: { type: String, default: "" },
  },
  { _id: false },
);

const measureSchema = new mongoose.Schema<ProductionMeasure>(
  {
    length: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    MeasureSpace: { type: Number, default: 0 },
    elements: { type: Number, default: 0 },
    gates: { type: gatesSchema, default: () => ({}) },
    cut: { type: Number, default: undefined },
    done: { type: Number, default: undefined },
    holes: { type: Number, default: undefined },
    postone: { type: Boolean, default: false },
    kampas: { type: cornerSchema, default: () => ({}) },
    laiptas: { type: stepSchema, default: () => ({}) },
  },
  { _id: false },
);

const bindingSchema = new mongoose.Schema(
  {
    id: String,
    color: { type: String, default: "" },
    height: { type: Number, default: 0 },
    name: { type: String, default: "" },
    quantity: { type: Number, default: 0 },
    cut: { type: Number, default: undefined },
    done: { type: Number, default: undefined },
    postone: { type: Boolean, default: false },
    category: { type: String, default: "" },
    files: { type: [String], default: [] },
  },
  { _id: false },
);

const fenceSchema = new mongoose.Schema<ProductionFence>(
  {
    id: String,
    side: { type: String, default: "Priekis" },
    name: { type: String, default: "" },
    color: { type: String, default: "" },
    material: { type: String, default: "" },
    manufacturer: { type: String, default: "Arcelor" },
    holes: { type: String, default: "Taip" },
    step: { type: Number, default: 0 },
    services: { type: String, default: "" },
    seeThrough: { type: String, default: "" },
    direction: { type: String, default: "" },
    parts: { type: String, default: "" },
    comment: { type: String, default: "" },
    twoSided: { type: String, default: "" },
    bindings: { type: String, default: "" },
    anchoredPoles: { type: String, default: "" },
    space: { type: Number, default: 0 },
    elements: { type: Number, default: 0 },
    holesDone: { type: Number, default: 0 },
    totalLength: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 },
    files: { type: [String], default: [] },
    measures: { type: [measureSchema], default: [] },
  },
  { _id: false },
);

const commentSchema = new mongoose.Schema(
  {
    date: String,
    creator: String,
    comment: String,
  },
  { _id: false },
);

const productionSchema = new mongoose.Schema<Production>({
  client: Object,
  creator: Object,
  orderNumber: String,
  status: {
    type: String,
    required: false,
    default: "Negaminti",
  },
  fences: {
    type: [fenceSchema],
    default: [],
  },
  bindings: {
    type: [bindingSchema],
    required: false,
    default: [],
  },
  comments: {
    type: [commentSchema],
    required: false,
    default: [],
  },
  files: {
    type: [String],
    required: false,
    default: [],
  },
});

export default mongoose.model("production", productionSchema, "production");
