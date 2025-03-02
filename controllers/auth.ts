import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userSchema from "../schemas/userSchema";
import response from "../modules/response";
import io from "../sockets/main";
import { Request, Response } from "express";
require("dotenv").config();

interface RegisterRequestBody {
  email: string;
  password: string;
  retypePassword: string;
  username: string;
}

export default {
  register: async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    const { email, password, username } = req.body;

    const userExists = await userSchema.findOne({ email });
    if (userExists) {
      return response(res, false, null, "Vartotojas jau egzistuoja");
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT as string));

    const user = new userSchema({
      username,
      email,
      password: hashedPassword,
    });

    const newUser: any = await user.save;

    if (newUser) {
      newUser.password = "";
      io.emit("newUser", newUser);
    }
    return response(res, true, null, "Sėkmingai prisiregistruota");
  },

  ///////////////////////////////////////////////////////////////////
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const data = await userSchema.findOne({ email });

    if (!data) {
      return response(res, false, null, "Vartotojas nerastas");
    }
    if (!data.verified) {
      return response(res, false, null, "Vartotojas nepatvirtintas");
    }

    const passwordMatch = await bcrypt.compare(password, data.password!);
    if (!passwordMatch) {
      return response(res, false, null, "Neteisingas slaptažodis");
    }

    const token = jwt.sign(
      {
        id: data._id,
        email: data.email,
        verified: data.verified,
        accountType: data.accountType,
      },
      process.env.TOKEN_SECRET as string,
      { expiresIn: "90d" }
    );

    data.password = "";

    res.cookie("mtud", token, {
      maxAge: 7776000 * 1000,
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
      path: "/",
    });

    return response(res, true, data, "Prisijungimas sėkmingas");
  },

  ///////////////////////////////////////////////////////////////////
  getUser: async (req: Request, res: Response) => {
    const { user } = req.body;
    const foundUser = await userSchema.findOne({ username: user });
    foundUser && (foundUser.password = "");
    return response(res, true, foundUser, "ok");
  },

  ///////////////////////////////////////////////////////////////////
  getUsers: async (req: Request, res: Response) => {
    const users = await userSchema.find();
    return response(res, true, users, "ok");
  },

  logout: (req: Request, res: Response) => {
    res.clearCookie("token");
    return response(res, true, null, "Logged out successfully");
  },
};
