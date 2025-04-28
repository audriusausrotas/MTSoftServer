import mongoose from "mongoose";
import { SelectValues } from "../data/interfaces";

const selectSchema = new mongoose.Schema<SelectValues>({
  fenceMaterials: { type: [String], required: true, default: [] },
  gateOption: { type: [String], required: true, default: [] },
  gateLock: { type: [String], required: true, default: [] },
  gateTypes: { type: [String], required: true, default: [] },
  fenceColors: { type: [String], required: true, default: [] },
  fenceTypes: { type: [String], required: true, default: [] },
  retailFenceTypes: { type: [String], required: true, default: [] },
  status: { type: [String], required: true, default: [] },
  accountTypes: { type: [String], required: true, default: [] },
});

export default mongoose.model("selectData", selectSchema, "selectData");
