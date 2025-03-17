import { Request, Response } from "express";
import response from "../modules/response";
import defaultValuesSchema from "../schemas/defaultValuesSchema";

export default {
  getDefaultValues: async (req: Request, res: Response) => {
    try {
      const data = await defaultValuesSchema.find();

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  newDefaultValue: async (req: Request, res: Response) => {
    try {
      const { value, field } = req.body;

      if (!(field in defaultValuesSchema.schema.paths)) {
        return response(res, false, null, `Netinkamas laukas "${field}"`);
      }

      const data = await defaultValuesSchema.findOneAndUpdate(
        {},
        { [field]: value },
        { new: true, upsert: true }
      );

      return response(res, true, data, "Pakeitimai atlikti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
