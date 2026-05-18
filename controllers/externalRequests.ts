import { Request, Response } from "express";
import response from "../modules/response";
import userSchema from "../schemas/userSchema";
import { orderFence } from "../services/externalServices";

export default {
  //////////////////// get requests ////////////////////////////////////

  getManagers: async (req: Request, res: Response) => {
    try {
      const data = await userSchema.find(
        {
          verified: true,
          accountType: { $in: ["Administratorius", "Vadybininkas"] },
        },
        { username: 1, email: 1, phone: 1, _id: 1 },
      );

      if (!data) return response(res, false, null, "Vartotoji nerasti");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  orderFence: async (req: Request, res: Response) => {
    try {
      const result = await orderFence(req.body);
      return response(res, true, result);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
