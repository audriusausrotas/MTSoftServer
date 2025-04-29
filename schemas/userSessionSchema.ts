import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema({
  socketID: { type: String, required: false },
  userID: { type: String, required: false, unique: true },
  accountType: { type: String, required: false },
  username: { type: String, required: false },
  email: { type: String, required: false },
});

export default mongoose.model("userSession", userSessionSchema, "userSessions");
