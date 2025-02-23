"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const socketDB_1 = __importDefault(require("../modules/socketDB"));
const server = http_1.default.createServer();
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
io.on("connection", (socket) => {
    console.log(`New socket connected: ${socket.id}`);
    socket.on("userID", (data) => {
        console.log(`Received userID: ${data} from socket: ${socket.id}`);
        socketDB_1.default.saveNewUser({ userID: data, socketID: socket.id });
    });
    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
        socketDB_1.default.deleteUser(socket.id);
    });
});
const port = 3002;
server.listen(port, () => {
    console.log(`Socket.io server is running on port ${port}`);
});
exports.default = io;
