import jwt, { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import cookie from "cookie";
import DB from "./socketDB";

const roomMapping: Record<string, string> = {
  Administratorius: "admin-room",
  Gamyba: "production-room",
  Montavimas: "installation-room",
  Sandėlys: "warehouse-room",
  Vartonas: "gates-room",
  Tiekėjas: "orders-room",
};

export default async (socket: Socket): Promise<boolean> => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.mtud;
    const secret = process.env.TOKEN_SECRET;

    if (!secret) {
      console.error("Nerastas TOKEN_SECRET");
      socket.disconnect(true);

      return false;
    }

    if (!token) {
      console.log("Žetonas nerastas");
      socket.disconnect(true);
      return false;
    }

    const user = jwt.verify(token, secret) as JwtPayload;

    await DB.saveNewUser({
      userID: user.id,
      socketID: socket.id,
      accountType: user.accountType,
      username: user.username,
      email: user.email,
    });

    const room = roomMapping[user.accountType];
    console.log(user.accountType);
    if (room) {
      socket.join(room);
      console.log(`${user.email} prisijungė prie ${room}`);
    }

    return true;
  } catch (error) {
    console.log("Netinkamas žetonas:", error);
    socket.disconnect(true);
    return false;
  }
};
