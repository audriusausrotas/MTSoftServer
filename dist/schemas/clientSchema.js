"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const clientSchema = new mongoose_1.default.Schema({
    username: {
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
});
exports.default = mongoose_1.default.model("clients", clientSchema);
