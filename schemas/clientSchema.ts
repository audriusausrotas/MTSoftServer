import mongoose from "mongoose";
import { Client } from "../data/interfaces";

const clientSchema = new mongoose.Schema<Client>({
  username: {
    type: String,
    required: true,
    default: "",
  },
  email: {
    type: String,
    required: true,
    default: "",
  },
  phone: {
    type: String,
    required: true,
    default: "",
  },
  address: {
    type: String,
    required: true,
    default: "",
  },
});

export default mongoose.model("clients", clientSchema, "clients");
