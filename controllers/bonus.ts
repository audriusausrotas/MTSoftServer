import { Response, Request } from "express";
import { Bonus } from "../data/interfaces";
import bonusSchema from "../schemas/bonusSchema";
import response from "../modules/response";
import { HydratedDocument } from "mongoose";

export default {
  //////////////////// get requests ////////////////////////////////////

  getBonus: async (req: Request, res: Response) => {
    try {
      const data: HydratedDocument<Bonus>[] | null = await bonusSchema.find();

      if (!data) return response(res, false, null, "Klaida");

      data.sort(
        (a, b) =>
          new Date(b.dateFinished).getTime() -
          new Date(a.dateFinished).getTime()
      );

      return response(res, true, null);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  //////////////////// update requests /////////////////////////////////

  //////////////////// post requests ///////////////////////////////////
};
