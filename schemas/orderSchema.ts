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
  ordered: {
    type: Boolean,
    required: false,
    default: false,
  },
  inWarehouse: {
    type: Boolean,
    required: false,
    default: false,
  },
  delivered: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const comment = new mongoose.Schema({
  date: String,
  creator: String,
  comment: String,
});

const orderSchema = new mongoose.Schema<Order>({
  projectID: String,
  creator,
  client,
  recipient: String,
  orderDate: String,
  deliveryDate: String,
  deliveryMethod: String,
  orderNr: {
    type: String,
    required: false,
    default: "",
  },
  status: {
    type: Boolean,
    required: false,
    default: true,
  },
  comments: {
    type: [comment],
    required: false,
    default: [],
  },
  data: [data],
});

export default mongoose.model("orders", orderSchema, "orders");
