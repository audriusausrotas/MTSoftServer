import { Request, Response } from "express";
import response from "../modules/response";
import userSchema from "../schemas/userSchema";
import { orderFence, orderAditionalFence } from "../services/externalServices";

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
    } catch (error: any) {
      console.error("Klaida:", error);
      return response(res, false, null, error.message);
    }
  },

  orderFence: async (req: Request, res: Response) => {
    try {
      const body = JSON.parse(req.body.data);
      const result = await orderFence(body);
      return response(res, true, result, "Tvora sėkmingai užsakyta");
    } catch (error: any) {
      console.error("Klaida:", error);
      return response(res, false, null, error.message);
    }
  },

  orderAdditionalFence: async (req: Request, res: Response) => {
    try {
      const body = JSON.parse(req.body.data);
      await orderAditionalFence(body);
      return response(res, true, null, "Papildomos detalės sėkmingai užsakytos");
    } catch (error: any) {
      console.error("Klaida:", error);
      return response(res, false, null, error.message);
    }
  },
};
