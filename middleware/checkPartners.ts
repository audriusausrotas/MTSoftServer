import { Request, Response, NextFunction } from "express";
import response from "../modules/response";
require("dotenv").config();

export default function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log("is middleware");
  console.log(req.body);
  try {
    const key = req.headers["x-api-key"];

    if (!key) {
      return response(res, false, null, "API raktas nerastas");
    }

    if (key !== process.env.SV_API_KEY) {
      return response(res, false, null, "API raktas neteisingas");
    }
    console.log("is middleware 2");
    console.log(req.body);
    next();
  } catch (error) {
    return response(res, false, null, "Server error");
  }
}
