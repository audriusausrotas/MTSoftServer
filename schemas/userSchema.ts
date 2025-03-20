import mongoose from "mongoose";
import { User } from "../data/interfaces";

const userSchema = new mongoose.Schema<User>({
  email: String,
  password: String,
  username: String,
  lastName: {
    type: String,
    required: false,
    default: "",
  },
  phone: {
    type: String,
    required: false,
    default: "",
  },
  verified: {
    type: Boolean,
    required: false,
    default: false,
  },
  accountType: {
    type: String,
    required: false,
    default: "Paprastas vartotojas",
  },
  photo: {
    type: Object,
    required: false,
    default: {},
  },
});

export default mongoose.model("users", userSchema, "users");
