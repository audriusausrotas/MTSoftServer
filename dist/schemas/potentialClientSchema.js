"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const potentialClientSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: false,
        default: "",
    },
    email: {
        type: String,
        required: false,
        default: "",
    },
    phone: {
        type: String,
        required: false,
        default: "",
    },
    address: {
        type: String,
        required: false,
        default: "",
    },
    status: {
        type: String,
        required: false,
        default: "",
    },
    send: {
        type: Boolean,
        required: false,
        default: true,
    },
});
exports.default = mongoose_1.default.model("potentialClients", potentialClientSchema);
