import mongoose from "mongoose";
import { Schedule } from "../data/interfaces";

const scheduleSchema = new mongoose.Schema<Schedule>({
  date: String,
  worker: Object,
  jobs: [Object],
  comment: {
    type: String,
    required: false,
    default: "",
  },
});

export default mongoose.model("schedule", scheduleSchema);
