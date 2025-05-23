import mongoose from "mongoose";
import { Prodution, ProdutionFence, ProdutionMeasure, GateInfo } from "../data/interfaces";

const gatesSchema = new mongoose.Schema<GateInfo>({
  exist: { type: Boolean, default: false },
  type: { type: String, default: "" },
  automatics: { type: String, default: "" },
  comment: { type: String, default: "" },
  direction: { type: String, default: "" },
  lock: { type: String, default: "" },
  bankette: { type: String, default: "" },
  option: { type: String, default: "" },
});

const cornerSchema = new mongoose.Schema({
  exist: { type: Boolean, default: false },
  value: { type: Number, default: 0 },
  comment: { type: String, default: "" },
});

const stepSchema = new mongoose.Schema({
  exist: { type: Boolean, default: false },
  value: { type: Number, default: 0 },
  direction: { type: String, default: "" },
});

const measureSchema = new mongoose.Schema<ProdutionMeasure>({
  length: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  MeasureSpace: { type: Number, default: 0 },
  elements: { type: Number, default: 0 },
  gates: { type: gatesSchema, default: () => ({}) },
  cut: { type: Number, default: undefined },
  done: { type: Number, default: undefined },
  postone: { type: Boolean, default: false },
  kampas: { type: cornerSchema, default: () => ({}) },
  laiptas: { type: stepSchema, default: () => ({}) },
});

const fenceSchema = new mongoose.Schema<ProdutionFence>({
  id: String,
  side: String,
  type: String,
  color: String,
  material: String,
  services: String,
  seeThrough: String,
  direction: String,
  parts: String,
  comment: String,
  twoSided: String,
  bindings: String,
  anchoredPoles: String,
  space: Number,
  elements: Number,
  totalLength: Number,
  totalQuantity: Number,
  measures: { type: [measureSchema], default: [] },
});

const productionSchema = new mongoose.Schema<Prodution>({
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
    type: [Object],
    required: false,
    default: [],
  },
  comments: {
    type: [Object],
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
