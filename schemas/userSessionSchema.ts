import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema({
  socketID: { type: String, required: true },
  userID: { type: String, required: true, unique: true },
  accountType: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
});

export default mongoose.model("userSession", userSessionSchema, "userSessions");
