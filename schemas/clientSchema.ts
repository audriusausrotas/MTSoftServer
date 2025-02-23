import mongoose from "mongoose";
import { Client } from "../data/interfaces";

const clientSchema = new mongoose.Schema<Client>({
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
});

export default mongoose.model("clients", clientSchema);
