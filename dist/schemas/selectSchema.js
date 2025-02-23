"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const selectSchema = new mongoose_1.default.Schema({
    fenceMaterials: { type: [String], required: false, default: [] },
    gateOption: { type: [String], required: false, default: [] },
    gateLock: { type: [String], required: false, default: [] },
    gateTypes: { type: [String], required: false, default: [] },
    fenceColors: { type: [String], required: false, default: [] },
    fenceTypes: { type: [String], required: false, default: [] },
    retailFenceTypes: { type: [String], required: false, default: [] },
    status: { type: [String], required: false, default: [] },
    accountTypes: { type: [String], required: false, default: [] },
});
exports.default = mongoose_1.default.model("selectData", selectSchema);
