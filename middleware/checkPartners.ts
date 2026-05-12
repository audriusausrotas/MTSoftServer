import { Request, Response, NextFunction } from "express";
import response from "../modules/response";
require("dotenv").config();

export default function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.headers["x-api-key"];

    if (!key) {
      return response(res, false, null, "API raktas nerastas");
    }

    if (key !== process.env.SV_API_KEY) {
      return response(res, false, null, "API raktas neteisingas");
    }

    next();
  } catch (error) {
    return response(res, false, null, "Server error");
  }
}
