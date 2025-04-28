import mongoose from "mongoose";
import { PotentialClient } from "../data/interfaces";

const potentialClientSchema = new mongoose.Schema<PotentialClient>({
  name: {
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
  status: {
    type: String,
    required: true,
    default: "",
  },
  send: {
    type: Boolean,
    required: true,
    default: true,
  },
});

export default mongoose.model(
  "potentialClients",
  potentialClientSchema,
  "potentialClients"
);
