"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userRightsSchema = new mongoose_1.default.Schema({
    accountType: {
        type: String,
        unique: true,
    },
    project: {
        type: Boolean,
        required: false,
        default: false,
    },
    schedule: {
        type: Boolean,
        required: false,
        default: false,
    },
    production: {
        type: Boolean,
        required: false,
        default: false,
    },
    installation: {
        type: Boolean,
        required: false,
        default: false,
    },
    gate: {
        type: Boolean,
        required: false,
        default: false,
    },
    admin: {
        type: Boolean,
        required: false,
        default: false,
    },
});
exports.default = mongoose_1.default.model("userRights", userRightsSchema);
