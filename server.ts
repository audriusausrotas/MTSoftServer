import mainRouter from "./router/mainRouter";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import express from "express";
import path from "path";
import cors from "cors";

require("dotenv").config();
import "./sockets/main";

const port = process.env.PORT || 3001;
const server = express();

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("connected to MongoDB"))

  .catch((e) => console.log(e));
server.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://mtsoft.lt",
      "http://localhost:3000/api",
      "https://mtsoft.lt/api",
    ],
    credentials: true,
  })
);
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
server.use(express.json());
server.use(cookieParser());
server.use("/api", mainRouter);

server.listen(port, () => console.log(`MTSoft server is running on port ${port}`));
