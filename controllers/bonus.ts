import bonusSchema from "../schemas/bonusSchema";
import { Response, Request } from "express";
import { HydratedDocument } from "mongoose";
import { Bonus } from "../data/interfaces";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getBonus: async (req: Request, res: Response) => {
    try {
      const data: HydratedDocument<Bonus>[] | null = await bonusSchema.find();

      if (!data) return response(res, false, null, "Klaida");

      data.sort((a, b) => new Date(b.dateFinished).getTime() - new Date(a.dateFinished).getTime());

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  //////////////////// update requests /////////////////////////////////

  //////////////////// post requests ///////////////////////////////////
};
