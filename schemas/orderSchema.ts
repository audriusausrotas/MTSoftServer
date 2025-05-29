import mongoose from "mongoose";
import { Order } from "../data/interfaces";

const creator = new mongoose.Schema({
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
  creator,
  client,
  recipient: String,
  status: String,
  orderNr: String,
  orderDate: String,
  deliveryDate: String,
  deliveryMethod: String,
  comments: {
    type: [comment],
    required: false,
    default: [],
  },
  data: [data],
});

export default mongoose.model("orders", orderSchema, "orders");
