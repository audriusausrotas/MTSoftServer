import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mainRouter from "./router/mainRouter";
import mongoose from "mongoose";
require("dotenv").config();
import "./sockets/main";

const port = process.env.PORT || 3001;
const server = express();

server.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

server.use(express.json());
server.use(cookieParser());
console.log("veikia");
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("connected to MongoDB"))
  .catch((e) => console.log(e));

server.use("/", mainRouter);

server.listen(port, () => console.log(`MTSoft server is running on port ${port}`));
