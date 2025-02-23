import { Server } from "socket.io";
import http from "http";
import DB from "../modules/socketDB";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`New socket connected: ${socket.id}`);

  socket.on("userID", (data) => {
    console.log(`Received userID: ${data} from socket: ${socket.id}`);
    DB.saveNewUser({ userID: data, socketID: socket.id });
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    DB.deleteUser(socket.id);
  });
});

const port = 3002;
server.listen(port, () => {
  console.log(`Socket.io server is running on port ${port}`);
});

export default io;
