import mongoose from "mongoose";
import { User } from "../data/interfaces";

const userSchema = new mongoose.Schema<User>({
  email: String,
  password: String,
  username: String,
  lastName: {
    type: String,
    required: true,
    default: "",
  },
  phone: {
    type: String,
    required: true,
    default: "",
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  accountType: {
    type: String,
    required: true,
    default: "Paprastas vartotojas",
  },
  photo: {
    type: String,
    required: true,
    default: "",
  },
});

export default mongoose.model("users", userSchema, "users");
