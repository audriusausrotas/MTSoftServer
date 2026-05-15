import { Request, Response } from "express";
import response from "../modules/response";
import { calculateEstimate } from "../services/calculationsServices";

export default {
  //////////////////// get requests ////////////////////////////////////

  calculateEstimate: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      const result = await calculateEstimate(req.body, user);

      return response(res, true, result);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
