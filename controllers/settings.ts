import defaultValuesSchema from "../schemas/defaultValuesSchema";
import userRightsSchema from "../schemas/userRightsSchema";
import productSchema from "../schemas/productSchema";
import selectSchema from "../schemas/selectSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getDefaultValues: async (req: Request, res: Response) => {
    try {
      const data = await defaultValuesSchema.find();

      return response(res, true, data[0]);
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
      const selects: any = await selectSchema.findOne();

      if (!selects) return response(res, false, null, "Serverio klaida");

      selects[field].splice(index, 1);

      const data = await selects.save();

      if (!data) return response(res, false, null, "Klaida saugant nustatymus");

      const responseData = { field, index };

      emit.toAdmin("deleteSelect", responseData);

      return response(res, true, responseData, "Išsaugota");
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

      const responseData = await productSchema.findByIdAndUpdate(_id, updatedData, {
        new: true,
      });

      if (!responseData) return response(res, false, null, "Produktas neegzistuoja");

      emit.toAdmin("updateFenceSettings", responseData);

      return response(res, true, responseData, "Pakeitimai atlikti");
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

      if (!data) return response(res, false, null, "Klaida saugant reikšmę");

      const responseData = { value, field };

      emit.toAdmin("newDefaultValue", responseData);

      return response(res, true, responseData, "Pakeitimai atlikti");
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

      const responseData = { field, value };

      emit.toAdmin("newSelectValue", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  newUserRights: async (req: Request, res: Response) => {
    try {
      const {
        accountType,
        project,
        schedule,
        production,
        installation,
        gate,
        admin,
        warehouse,
        orders,
      } = req.body;

      let doesExist = await userRightsSchema.findOne({ accountType });
      if (doesExist) {
        doesExist.project = project;
        doesExist.schedule = schedule;
        doesExist.production = production;
        doesExist.installation = installation;
        doesExist.orders = orders;
        doesExist.gate = gate;
        doesExist.admin = admin;
        doesExist.warehouse = warehouse;
      } else
        doesExist = new userRightsSchema({
          accountType,
          project,
          schedule,
          production,
          installation,
          gate,
          orders,
          admin,
          warehouse,
        });

      const responseData = await doesExist.save();

      emit.toEveryone("newUserRights", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
