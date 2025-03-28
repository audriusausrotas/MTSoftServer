"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const gatesSchema = new mongoose_1.default.Schema({
  exist: { type: Boolean, default: false },
  type: { type: String, default: "" },
  automatics: { type: String, default: "" },
  comment: { type: String, default: "" },
  direction: { type: String, default: "" },
  lock: { type: String, default: "" },
  bankette: { type: String, default: "" },
  option: { type: String, default: "" },
});
const kampasSchema = new mongoose_1.default.Schema({
  exist: { type: Boolean, default: false },
  value: { type: Number, default: 0 },
  comment: { type: String, default: "" },
});
const laiptasSchema = new mongoose_1.default.Schema({
  exist: { type: Boolean, default: false },
  value: { type: Number, default: 0 },
  direction: { type: String, default: "" },
});
const measureSchema = new mongoose_1.default.Schema({
  length: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  MeasureSpace: { type: Number, default: 0 },
  elements: { type: Number, default: 0 },
  gates: { type: gatesSchema, default: () => ({}) },
  cut: { type: Number, default: undefined },
  done: { type: Number, default: undefined },
  postone: { type: Boolean, default: false },
  kampas: { type: kampasSchema, default: () => ({}) },
  laiptas: { type: laiptasSchema, default: () => ({}) },
});
const fenceSchema = new mongoose_1.default.Schema({
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
const productionSchema = new mongoose_1.default.Schema({
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
  comment: {
    type: [Object],
    required: false,
    default: [],
  },
  files: {
    type: [Object],
    required: false,
    default: [],
  },
});
exports.default = mongoose_1.default.model("gamyba", productionSchema);
