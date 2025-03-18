import { Request, Response } from "express";
import response from "../modules/response";
import defaultValuesSchema from "../schemas/defaultValuesSchema";
import productSchema from "../schemas/productSchema";
import selectSchema from "../schemas/selectSchema";
import userRightsSchema from "../schemas/userRightsSchema";

export default {
  //////////////////// get requests ////////////////////////////////////

  getDefaultValues: async (req: Request, res: Response) => {
    try {
      const data = await defaultValuesSchema.find();

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getSelects: async (req: Request, res: Response) => {
    try {
      const data = await selectSchema.find();

      if (data.length === 0) return response(res, false, null, "Nustatymai nerasti");

      return response(res, true, data[0]);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getUserRights: async (req: Request, res: Response) => {
    try {
      const data = await userRightsSchema.find();

      if (data.length === 0) return response(res, false, null, "Nustatymai nerasti");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteSelect: async (req: Request, res: Response) => {
    try {
      const { field, index } = req.body;
      const data: any = await selectSchema.findOne();

      if (!data) return response(res, false, null, "Serverio klaida");

      data[field].splice(index, 1);
      await data.save();

      return response(res, true, data, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  updateFenceData: async (req: Request, res: Response) => {
    try {
      const { _id, width, height, isFenceBoard, defaultDirection, seeThrough } = req.body;

      const updatedData = {
        width,
        height,
        isFenceBoard,
        defaultDirection,
        seeThrough,
      };

      const data = await productSchema.findOneAndUpdate({ _id }, updatedData, {
        new: true,
      });

      if (!data) return response(res, false, null, "Produktas neegzistuoja");

      return response(res, true, data, "Pakeitimai atlikti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

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

  newSelect: async (req: Request, res: Response) => {
    try {
      const { field, value } = req.body;

      const data = await selectSchema.findOneAndUpdate(
        {},
        { $push: { [field]: value } },
        { new: true, upsert: true }
      );

      if (!data) return response(res, false, null, "Serverio klaida");

      return response(res, true, data, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addUserRights: async (req: Request, res: Response) => {
    try {
      const { accountType, project, schedule, production, installation, gate, admin } = req.body;

      let doesExist = await userRightsSchema.findOne({ accountType });
      if (doesExist) {
        doesExist.project = project;
        doesExist.schedule = schedule;
        doesExist.production = production;
        doesExist.installation = installation;
        doesExist.gate = gate;
        doesExist.admin = admin;
      } else
        doesExist = new userRightsSchema({
          accountType,
          project,
          schedule,
          production,
          installation,
          gate,
          admin,
        });

      const data = await doesExist.save();

      return response(res, true, data, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
