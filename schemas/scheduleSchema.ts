import mongoose from "mongoose";
import { Schedule } from "../data/interfaces";

const scheduleSchema = new mongoose.Schema<Schedule>({
  date: {
    type: Date,
    required: true,
  },
  worker: Object,
  jobs: [Object],
  comment: {
    type: String,
    required: false,
    default: "",
  },
});

export default mongoose.model("schedule", scheduleSchema, "schedule");
