import mongoose from "mongoose";
import { Client, Comment, Creator, Order, OrderData } from "../data/interfaces";

const creator = new mongoose.Schema<Creator>(
  {
    username: String,
    lastName: String,
    email: String,
    phone: String,
  },
  { _id: false }
);

const client = new mongoose.Schema<Client>(
  {
    username: String,
    address: String,
    email: String,
    phone: String,
  },
  { _id: false }
);

const data = new mongoose.Schema<OrderData>(
  {
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
  },
  { _id: false }
);

const comment = new mongoose.Schema<Comment>(
  {
    date: String,
    creator: String,
    comment: String,
  },
  { _id: false }
);

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
