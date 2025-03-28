import mongoose from "mongoose";
import {
  GateInfo,
  Installation,
  InstallationFence,
  InstallationMeasure,
  InstallationResult,
  InstallationWorks,
} from "../data/interfaces";

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

const measureSchema = new mongoose.Schema<InstallationMeasure>({
  length: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  MeasureSpace: { type: Number, default: 0 },
  elements: { type: Number, default: 0 },
  gates: { type: gatesSchema, default: () => ({}) },
  done: { type: Boolean, default: false },
  postone: { type: Boolean, default: false },
  kampas: { type: cornerSchema, default: () => ({}) },
  laiptas: { type: stepSchema, default: () => ({}) },
});

const resultSchema = new mongoose.Schema<InstallationResult>({
  type: { type: String, default: "" },
  quantity: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  color: { type: String, default: "" },
  width: { type: Number, default: 0 },
  category: { type: String, default: "" },
  delivered: { type: Boolean, required: false, default: false },
});

const workSchema = new mongoose.Schema<InstallationWorks>({
  name: { type: String, default: "" },
  quantity: { type: Number, default: 0 },
  delivered: { type: Boolean, required: false, default: false },
});

const fenceSchema = new mongoose.Schema<InstallationFence>({
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

const installationSchema = new mongoose.Schema<Installation>({
  client: Object,
  creator: Object,
  orderNumber: String,
  workers: [String],
  status: {
    type: String,
    required: false,
    default: "Montuojama",
  },
  fences: {
    type: [fenceSchema],
    default: [],
  },
  results: {
    type: [resultSchema],
    default: [],
  },
  works: {
    type: [workSchema],
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

export default mongoose.model("montavimas", installationSchema, "montavimas");
