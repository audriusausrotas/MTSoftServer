"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const gateSchema = new mongoose_1.default.Schema({
    _id: Object,
    client: Object,
    creator: Object,
    manager: String,
    orderNr: {
        type: String,
        required: false,
        default: "",
    },
    comments: {
        type: [Object],
        required: false,
        default: [],
    },
    measure: {
        type: String,
        required: false,
        default: "Eilėje",
    },
    gates: [Object],
    dateCreated: String,
});
exports.default = mongoose_1.default.model("gates", gateSchema);
