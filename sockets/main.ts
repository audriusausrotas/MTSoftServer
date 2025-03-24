import jwt, { JwtPayload } from "jsonwebtoken";
import DB from "../modules/socketDB";
import { Server } from "socket.io";
import cookie from "cookie";
require("dotenv").config();
import http from "http";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const token = cookies.mtud;
  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    console.error(" TOKEN_SECRET is not defined in environment variables.");
    return;
  }

  if (token) {
    try {
      const user = jwt.verify(token, secret) as JwtPayload;

      DB.saveNewUser({
        userID: user.id,
        socketID: socket.id,
        accountType: user.accountType,
        username: user.username,
        email: user.email,
      });
      console.log(`New socket connected: ${user.email}`);
    } catch (error) {
      console.log("Invalid or expired token:", error);

      return socket.disconnect(true);
    }
  } else {
    console.log("No token found in cookies");

    return socket.disconnect(true);
  }

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
