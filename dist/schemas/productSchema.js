"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const seeThroughSchema = new mongoose_1.default.Schema({
    Aklina: { space: Number, price: Number, cost: Number },
    Nepramatoma: { space: Number, price: Number, cost: Number },
    Vidutiniška: { space: Number, price: Number, cost: Number },
    Pramatoma: { space: Number, price: Number, cost: Number },
    "25% Pramatomumas": { space: Number, price: Number, cost: Number },
    "50% Pramatomumas": { space: Number, price: Number, cost: Number },
});
const productSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    cost: { type: Number, required: false, default: 0 },
    category: { type: String, required: false, default: "Kita" },
    image: { type: String, required: false },
    height: { type: Number, required: false },
    width: { type: Number, required: false },
    isFenceBoard: { type: Boolean, required: false },
    defaultDirection: { type: String, required: false },
    seeThrough: { type: seeThroughSchema, required: false },
});
exports.default = mongoose_1.default.model("products", productSchema);
