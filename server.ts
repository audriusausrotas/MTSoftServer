import mainRouter from "./router/mainRouter";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import express from "express";
import path from "path";
import cors from "cors";

require("dotenv").config();

import "./sockets/main";
import "./cronJobs/main";

const port = process.env.PORT || 3001;
const server = express();

const dbURI =
  process.env.NODE_ENV === "development"
    ? process.env.MONGODB_URI_REMOTE
    : process.env.MONGODB_URI_LOCAL;

mongoose
  .connect(dbURI as string)
  .then(() =>
    console.log(
      `Connected to MongoDB at ${
        process.env.NODE_ENV === "development" ? "Atlas Server" : "Local Server"
      }`
    )
  )
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
server.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? ["http://localhost:3000", "https://mtsoft.lt"]
        : ["https://mtsoft.lt"],
    credentials: true,
  })
);

server.use("/uploads", express.static(path.join(__dirname, "dist/uploads")));

server.use(express.json());
server.use(cookieParser());
server.use("/api", mainRouter);

server.listen(port, () => console.log(`MTSoft server is running on port ${port}`));

const shutdownHandler = async (signal: string) => {
  console.log(`Received ${signal}. Closing MongoDB connection...`);
  await mongoose.connection.close();
  console.log("MongoDB disconnected, shutting down server...");
  process.exit(0);
};

process.on("SIGINT", () => shutdownHandler("SIGINT"));
process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
