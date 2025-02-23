"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const deletedSchema = new mongoose_1.default.Schema({
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
    files: {
        type: [Object],
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
exports.default = mongoose_1.default.model("projectsDeleted", deletedSchema);
