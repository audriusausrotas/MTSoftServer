import mongoose from "mongoose";
import { SelectValues } from "../data/interfaces";

const selectSchema = new mongoose.Schema<SelectValues>({
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

export default mongoose.model("selectData", selectSchema);
