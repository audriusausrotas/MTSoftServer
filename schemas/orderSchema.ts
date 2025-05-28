import mongoose from "mongoose";
import { Order } from "../data/interfaces";

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

const comment = new mongoose.Schema({
  date: String,
  creator: String,
  comment: String,
});

const orderSchema = new mongoose.Schema<Order>({
  user,
  client,
  data: [data],
  orderDate: String,
  deliveryDate: String,
  deliveryMethod: String,
  comments: {
    type: [comment],
    required: false,
    default: [],
  },
  recipient: String,
});

export default mongoose.model("orders", orderSchema, "orders");
