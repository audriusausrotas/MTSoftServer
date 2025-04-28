import mongoose from "mongoose";
import { UserRights } from "../data/interfaces";

const userRightsSchema = new mongoose.Schema<UserRights>({
  accountType: {
    type: String,
    unique: true,
  },
  project: {
    type: Boolean,
    required: true,
    default: false,
  },
  schedule: {
    type: Boolean,
    required: true,
    default: false,
  },
  production: {
    type: Boolean,
    required: true,
    default: false,
  },
  installation: {
    type: Boolean,
    required: true,
    default: false,
  },
  gate: {
    type: Boolean,
    required: true,
    default: false,
  },
  admin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default mongoose.model("userRights", userRightsSchema, "userRights");
