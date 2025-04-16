import mongoose from "mongoose";
import { Bonus } from "../data/interfaces";

const bonusSchema = new mongoose.Schema<Bonus>({
  address: String,
  dateFinished: String,
  price: Number,
  cost: Number,
  profit: Number,
  margin: Number,
  user: String,
});

export default mongoose.model("bonus", bonusSchema, "bonus");
