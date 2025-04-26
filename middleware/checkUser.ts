import { Request, Response, NextFunction } from "express";
import response from "../modules/response";
import { User } from "../data/interfaces";
import jwt from "jsonwebtoken";
require("dotenv").config();

// export default (req: Request, res: Response, next: NextFunction) => {
//   const token = req.cookies?.mtud;

//   if (!token) return response(res, false, null, "Žetonas nerastas");

//   try {
//     const user = jwt.verify(token, process.env.TOKEN_SECRET as string) as User;

//     res.locals.user = user;
//     next();
//   } catch (error) {
//     return response(res, false, null, "Netinkamas žetonas");
//   }
// };
export default (req: Request, res: Response, next: NextFunction) => {
  console.log("Incoming Request:", req.method, req.path);
  console.log("Cookies Received:", req.cookies);

  const token = req.cookies?.mtud;

  if (!token) {
    console.log("JWT Token missing!");
    return response(res, false, null, "Žetonas nerastas");
  }

  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET as string) as User;

    console.log("Verified User:", user);
    res.locals.user = user;
    next();
  } catch (error) {
    console.log("JWT Verification Failed:", error);
    return response(res, false, null, "Netinkamas žetonas");
  }
};
