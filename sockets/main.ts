import authMiddleware from "./authMiddleware";
import { Server, Socket } from "socket.io";
import DB from "./socketDB";
import http from "http";
require("dotenv").config();

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },
});

io.on("connection", async (socket: Socket) => {
  console.log(`New connection attempt: ${socket.id}`);

  const isAuthenticated = await authMiddleware(socket);
  if (!isAuthenticated) return;

  socket.on("disconnect", async () => {
    console.log(`Socket disconnected: ${socket.id}`);
    await DB.deleteUser(socket.id);
  });
});

const port = 3002;
server.listen(port, () => {
  console.log(`Socket.io server is running on port ${port}`);
});

export { io };

// socket.emit(): Send to the sender (the client).
// socket.broadcast.emit(): Send to everyone except the sender.
// io.emit(): Send to everyone (including the sender).
// socket.to(<socketId>).emit(): Send to a specific client by their socket ID.

// Room Management:
// socket.join(<room>)
// socket.leave(<room>)
// socket.in(<room>).emit(): Send to all clients in a specific room.
// socket.broadcast.to(<room>).emit(): Send to all clients in a room, except the sender.
