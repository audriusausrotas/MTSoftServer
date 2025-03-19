import { Request, Response, NextFunction } from "express";
import response from "../modules/response";
import { User } from "../data/interfaces";
import jwt from "jsonwebtoken";
require("dotenv").config();

export default {
  checkUser: (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
      return response(res, false, null, "Žetonas nerastas");
    }

    try {
      const user = jwt.verify(
        token,
        process.env.TOKEN_SECRET as string
      ) as User;

      res.locals.user = user;
      next();
    } catch (error) {
      return response(res, false, null, "Netinkamas žetonas");
    }
  },

  checkAdmin: (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
      return response(res, false, null, "Netinkamas žetonas");
    }

    try {
      const user = jwt.verify(
        token,
        process.env.TOKEN_SECRET as string
      ) as User;

      if (user.accountType !== "Administratorius") {
        return response(res, false, null, "");
      }

      res.locals.user = user;
      next();
    } catch (error) {
      return response(res, false, null, "Serverio klaida");
    }
  },
};
