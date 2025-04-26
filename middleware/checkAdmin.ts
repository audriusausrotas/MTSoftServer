import { Request, Response, NextFunction } from "express";
import response from "../modules/response";
import { User } from "../data/interfaces";
import jwt from "jsonwebtoken";
require("dotenv").config();

export default (req: Request, res: Response, next: NextFunction) => {
  console.log(req.cookies);
  const token = req.cookies?.mtud;
  console.log(token);
  if (!token) {
    return response(res, false, null, "Netinkamas žetonas");
  }

  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET as string) as User;

    if (user.accountType !== "Administratorius") {
      return response(res, false, null, "Vartotojas neturi teisių");
    }

    res.locals.user = user;
    next();
  } catch (error) {
    return response(res, false, null, "Serverio klaida");
  }
};
