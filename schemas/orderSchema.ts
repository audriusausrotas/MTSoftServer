import mongoose from "mongoose";
import { Orders } from "../data/interfaces";

const orderSchema = new mongoose.Schema<Orders>({});

export default mongoose.model("orders", orderSchema, "orders");
