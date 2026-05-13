import { Request, Response } from "express";
import response from "../modules/response";
import userSchema from "../schemas/userSchema";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getManagers: async (req: Request, res: Response) => {
    try {
      const data = await userSchema.find(
        {
          verified: true,
          accountType: { $in: ["Administratorius", "Vadybininkas"] },
        },
        { username: 1, _id: 0 },
      );

      if (!data) return response(res, false, null, "Vartotoji nerasti");

      const usernames = data.map((item) => item.username);

      return response(res, true, usernames);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  orderFence: async (req: Request, res: Response) => {
    try {
      return response(res, true, "this shit works");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
