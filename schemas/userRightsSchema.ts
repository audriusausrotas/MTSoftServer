import mongoose from "mongoose";
import { UserRights } from "../data/interfaces";

const userRightsSchema = new mongoose.Schema<UserRights>({
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
  warehouse: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export default mongoose.model("userRights", userRightsSchema, "userRights");
