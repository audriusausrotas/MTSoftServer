import response from "../modules/response";
import jwt from "jsonwebtoken";
require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { User } from "../data/interfaces";

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return response(res, false, null, "Auth error: No token provided");
  }

  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET as string) as User;

    req.body.user = {
      _id: user._id,
      email: user.email,
      verified: user.verified,
      accountType: user.accountType,
      password: "",
      username: user.username,
      lastName: user.lastName,
      phone: user.phone,
      photo: user.photo,
    };

    next();
  } catch (error) {
    return response(res, false, null, "Auth error: Invalid token");
  }
};
