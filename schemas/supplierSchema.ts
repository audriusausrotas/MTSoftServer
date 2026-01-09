import mongoose from "mongoose";
import { Supplier } from "../data/interfaces";

const supplierSchema = new mongoose.Schema<Supplier>({
  username: {
    type: String,
    required: false,
    default: "",
  },
  email: {
    type: String,
    required: false,
    default: "",
  },
  phone: {
    type: String,
    required: false,
    default: "",
  },
  address: {
    type: String,
    required: false,
    default: "",
  },
  company: {
    type: String,
    required: false,
    default: "",
  },
});

export default mongoose.model("suppliers", supplierSchema, "suppliers");
