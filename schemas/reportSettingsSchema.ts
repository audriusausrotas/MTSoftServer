import mongoose from "mongoose";
import { ReportSettings } from "../data/interfaces";

const reportSettingsSchema = new mongoose.Schema<ReportSettings>({
  name: {
    type: String,
    required: false,
    default: "",
  },
  keyword: {
    type: String,
    required: false,
    default: "",
  },
  bends: {
    type: String,
    required: false,
    default: "",
  },
});

export default mongoose.model("reportSettings", reportSettingsSchema, "reportSettings");
