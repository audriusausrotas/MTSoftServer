import mongoose from "mongoose";

const passwordsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  generatedAt: { type: Date, required: true },
});

export default mongoose.model("passwords", passwordsSchema, "passwords");
