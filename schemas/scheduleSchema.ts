import mongoose from "mongoose";
import { Schedule } from "../data/interfaces";

const scheduleSchema = new mongoose.Schema<Schedule>({
  date: {
    type: String,
  },
  worker: Object,
  jobs: [Object],
  comment: {
    type: String,
    default: "",
  },
});

export default mongoose.model("schedule", scheduleSchema, "schedule");
