import response from "../modules/response";
import backupSchema from "../schemas/backupSchema";
import io from "../sockets/main";
import { Request, Response } from "express";

export default {
  //////////////////// get requests ////////////////////////////////////

  getBackup: async (req: Request, res: Response) => {
    try {
      const backup = await backupSchema.find();

      if (!backup)
        return response(res, false, null, "Atsarginių kopijų nerasta");

      backup.reverse();

      const data = backup.map((item) => {
        return {
          _id: item._id,
          orderNumber: item.orderNumber,
          client: item.client,
          priceVAT: item.priceVAT,
          priceWithDiscount: item.priceWithDiscount,
          status: item.status,
          discount: item.discount,
        };
      });
      if (!data) return response(res, false, data);
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  //////////////////// update requests /////////////////////////////////

  //////////////////// post requests ///////////////////////////////////
};
