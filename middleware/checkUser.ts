import { Request, Response, NextFunction } from "express";
import response from "../modules/response";
import { User } from "../data/interfaces";
import jwt from "jsonwebtoken";
require("dotenv").config();

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.mtud;

  if (!token) {
    return response(res, false, null, "Žetonas nerastas");
  }

  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET as string) as User;

    res.locals.user = user;
    next();
  } catch (error) {
    return response(res, false, null, "Netinkamas žetonas");
  }
};
