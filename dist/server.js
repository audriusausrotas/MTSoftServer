"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const mainRouter_1 = __importDefault(require("./router/mainRouter"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
require("./sockets/main");
const port = process.env.PORT || 3001;
const server = (0, express_1.default)();
server.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
server.use(express_1.default.json());
server.use((0, cookie_parser_1.default)());
mongoose_1.default
    .connect(process.env.MONGO_CONNECT)
    .then(() => console.log("connected to MongoDB"))
    .catch((e) => console.log(e));
server.use("/", mainRouter_1.default);
server.listen(port, () => console.log(`MTSoft server is running on port ${port}`));
