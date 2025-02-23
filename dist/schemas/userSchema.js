"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: String,
    password: String,
    username: String,
    lastName: {
        type: String,
        required: false,
        default: "",
    },
    phone: {
        type: String,
        required: false,
        default: "",
    },
    verified: {
        type: Boolean,
        required: false,
        default: false,
    },
    accountType: {
        type: String,
        required: false,
        default: "Paprastas vartotojas",
    },
    photo: {
        type: Object,
        required: false,
        default: {},
    },
});
exports.default = mongoose_1.default.model("users", userSchema);
