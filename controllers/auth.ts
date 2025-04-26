import userSchema from "../schemas/userSchema";
import { Response, Request } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export default {
  //////////////////// get requests ////////////////////////////////////

  getUser: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      const data = await userSchema.findById(user.id);

      data && (data.password = "");

      if (!data) return response(res, false, null, "Vartotojas nerastas");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  //////////////////// update requests /////////////////////////////////

  logout: (req: Request, res: Response) => {
    try {
      res.clearCookie("mtud");
      return response(res, true, null, "Logged out successfully");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  login: async (req: Request, res: Response) => {
    try {
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
          username: data.username,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          verified: data.verified,
          accountType: data.accountType,
        },
        process.env.TOKEN_SECRET as string,
        { expiresIn: "90d" }
      );

      data.password = "";

      res.cookie("mtud", token, {
        maxAge: 7776000 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
      });

      return response(res, true, data, "Prisijungimas sėkmingas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  register: async (req: Request, res: Response) => {
    try {
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

      const responseData: any = await user.save();

      if (responseData) {
        responseData.password = "";
        emit.toAdmin("newUser", responseData);
      }
      return response(res, true, null, "Sėkmingai prisiregistruota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
