import mongoose from "mongoose";
import { PotentialClient } from "../data/interfaces";

const potentialClientSchema = new mongoose.Schema<PotentialClient>({
  name: {
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
  status: {
    type: String,
    required: false,
    default: "",
  },
  send: {
    type: Boolean,
    required: false,
    default: true,
  },
});

export default mongoose.model("potentialClients", potentialClientSchema, "potentialClients");
