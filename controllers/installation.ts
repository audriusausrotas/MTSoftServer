import { Request, Response } from "express";
import installationSchema from "../schemas/installationSchema";
import response from "../modules/response";

export default {
  partsDelivered: async (req: Request, res: Response) => {
    try {
      const { _id, measureIndex, value } = req.body;

      const data = await installationSchema.findById(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      data.results[measureIndex].delivered = value;

      const newData = await data.save();

      return response(res, true, newData, "Pristatymas patvirtintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
