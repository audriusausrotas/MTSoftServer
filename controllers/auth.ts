import userSchema from "../schemas/userSchema";
import resetPasswordSchema from "../schemas/resetPasswordSchema";
import sendEmail from "../modules/sendEmail";
import { Response, Request } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import productionSchema from "../schemas/productionSchema";

export default {
  //////////////////// get requests ////////////////////////////////////

  getUser: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      const data = await userSchema.findById(user.id).lean();
      if (!data) return response(res, false, null, "Vartotojas nerastas");

      data.password = "";

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

      const data = await userSchema
        .findOne({ email: email.toLowerCase() })
        .lean();

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
        { expiresIn: "90d" },
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

      const userExists = await userSchema
        .findOne({ email: email.toLowerCase() })
        .lean();
      if (userExists) {
        return response(res, false, null, "Vartotojas jau egzistuoja");
      }

      const hashedPassword = await bcrypt.hash(
        password,
        parseInt(process.env.SALT as string),
      );

      const user = new userSchema({
        username,
        email: email.toLowerCase(),
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

  resetPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const data = await userSchema
        .findOne({ email: email.toLowerCase() })
        .lean();

      if (!data) {
        return response(res, false, null, "Vartotojas nerastas");
      }
      if (!data.verified) {
        return response(res, false, null, "Vartotojas nepatvirtintas");
      }

      const resetPasswordCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      const resetPassword = new resetPasswordSchema({
        email,
        code: resetPasswordCode,
        generatedAt: new Date(),
      });
      await resetPassword.save();

      const emailResult = await sendEmail({
        to: email,
        subject: "Slaptažodžio atstatymo kodas",
        html: `<p>Jūsų slaptažodžio atstatymo kodas: <strong>${resetPasswordCode}</strong></p>`,
        user: { email: "skardinimovizija@gmail.com" },
      });

      if (!emailResult.success) {
        return response(res, false, null, emailResult.message);
      }

      return response(
        res,
        true,
        data,
        "Slaptažodžio atstatymo kodas išsiųstas",
      );
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  loginWithoutPassword: async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;

      const data = await userSchema
        .findOne({ email: email.toLowerCase() })
        .lean();

      if (!data) {
        return response(res, false, null, "Vartotojas nerastas");
      }
      if (!data.verified) {
        return response(res, false, null, "Vartotojas nepatvirtintas");
      }

      const resetPassword = await resetPasswordSchema.findOne({
        email: email.toLowerCase(),
        code,
      });

      if (!resetPassword) {
        return response(res, false, null, "Neteisingas kodas");
      }

      const now = new Date();
      const codeAge = now.getTime() - resetPassword.generatedAt.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (codeAge > fiveMinutes) {
        await resetPasswordSchema.deleteOne({
          email: email.toLowerCase(),
          code,
        });
        return response(res, false, null, "Kodas nebegalioja");
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
        { expiresIn: "90d" },
      );

      data.password = "";

      res.cookie("mtud", token, {
        maxAge: 7776000 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
      });

      await resetPasswordSchema.deleteOne({ email: email.toLowerCase(), code });

      return response(res, true, data, "Prisijungimas sėkmingas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
