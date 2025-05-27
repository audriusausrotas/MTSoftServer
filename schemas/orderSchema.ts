import mongoose from "mongoose";
import { Orders } from "../data/interfaces";

const user = new mongoose.Schema({
  username: String,
  lastName: String,
  email: String,
  phone: String,
});

const client = new mongoose.Schema({
  username: String,
  address: String,
  email: String,
  phone: String,
});

const data = new mongoose.Schema({
  name: String,
  color: String,
  quantity: Number,
  measureIndex: Number,
});

const orderSchema = new mongoose.Schema<Orders>({
  user,
  client,
  data: [data],
  orderDate: String,
  deliveryDate: String,
  deliveryMethod: String,
  message: String,
  recipient: String,
});

export default mongoose.model("orders", orderSchema, "orders");
