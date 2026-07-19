import mongoose from "mongoose";
import { ReportsGeneral } from "../data/interfaces";

const reportGeneralSettingsSchema = new mongoose.Schema<ReportsGeneral>({
  workStart1: { type: String, required: false, default: "" },
  workStart2: { type: String, required: false, default: "" },
  workEnd1: { type: String, required: false, default: "" },
  workEnd2: { type: String, required: false, default: "" },
  cutGoal1: { type: Number, required: false, default: 0 },
  cutGoal2: { type: Number, required: false, default: 0 },
  bendGoal1M1: { type: Number, required: false, default: 0 },
  bendGoal2M1: { type: Number, required: false, default: 0 },
  bendGoal1M2: { type: Number, required: false, default: 0 },
  bendGoal2M2: { type: Number, required: false, default: 0 },
  holesGoal1: { type: Number, required: false, default: 0 },
  holesGoal2: { type: Number, required: false, default: 0 },
  holesIndex: { type: Number, required: false, default: 0 },
  bendCost: { type: Number, required: false, default: 0 },
});

export default mongoose.model(
  "reportGeneralSettings",
  reportGeneralSettingsSchema,
  "reportGeneralSettings",
);
