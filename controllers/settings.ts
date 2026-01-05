import defaultValuesSchema from "../schemas/defaultValuesSchema";
import userRightsSchema from "../schemas/userRightsSchema";
import productSchema from "../schemas/productSchema";
import selectSchema from "../schemas/selectSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import fenceSchema from "../schemas/fenceSchema";
import { FenceSetup, Gates } from "../data/interfaces";
import gatePriceSchema from "../schemas/gatePriceSchema";

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

  getFences: async (req: Request, res: Response) => {
    try {
      const data = await fenceSchema.find();

      if (data.length === 0) return response(res, false, null, "Tvoros nerastos");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getGateData: async (req: Request, res: Response) => {
    try {
      const data = await gatePriceSchema.find();

      if (data.length === 0) return response(res, false, null, "Vartai nerasti");

      return response(res, true, data);
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

  deleteFenceSettings: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const deleteFence = await fenceSchema.findByIdAndDelete(_id);

      if (!deleteFence) return response(res, false, null, "Tvora nerasta");

      emit.toAdmin("deleteFenceSettings", { _id });

      return response(res, true, { _id }, "Tvora ištrinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  updateFenceData: async (req: Request, res: Response) => {
    try {
      const { _id, name, category, defaultDirection, steps, details, prices, profit } = req.body;

      const updatedData: FenceSetup = {
        _id,
        name,
        category,
        defaultDirection,
        profit: {
          premiumRetail: profit.premiumRetail,
          premiumWholesale: profit.premiumWholesale,
          ecoRetail: profit.ecoRetail,
          ecoWholesale: profit.ecoWholesale,
        },
        details: {
          height: details.height,
          width: details.width,
          bends: details.bends,
          holes: details.holes,
        },
        steps: {
          aklina: steps.aklina,
          nepramatoma: steps.nepramatoma,
          vidutiniska: steps.vidutiniska,
          pramatoma: steps.pramatoma,
          pramatoma25: steps.pramatoma25,
          pramatoma50: steps.pramatoma50,
        },

        prices: {
          cost: prices.cost,
          priceRetail: prices.priceRetail,
          priceWholesale: prices.priceWholesale,
          premium: {
            meter: {
              cost: prices.premium.meter.cost,
              priceRetail: prices.premium.meter.priceRetail,
              priceWholesale: prices.premium.meter.priceWholesale,
            },
            aklina: {
              cost: prices.premium.aklina.cost,
              priceRetail: prices.premium.aklina.priceRetail,
              priceWholesale: prices.premium.aklina.priceWholesale,
            },
            nepramatoma: {
              cost: prices.premium.nepramatoma.cost,
              priceRetail: prices.premium.nepramatoma.priceRetail,
              priceWholesale: prices.premium.nepramatoma.priceWholesale,
            },
            vidutiniska: {
              cost: prices.premium.vidutiniska.cost,
              priceRetail: prices.premium.vidutiniska.priceRetail,
              priceWholesale: prices.premium.vidutiniska.priceWholesale,
            },
            pramatoma: {
              cost: prices.premium.pramatoma.cost,
              priceRetail: prices.premium.pramatoma.priceRetail,
              priceWholesale: prices.premium.pramatoma.priceWholesale,
            },
            pramatoma25: {
              cost: prices.premium.pramatoma25.cost,
              priceRetail: prices.premium.pramatoma25.priceRetail,
              priceWholesale: prices.premium.pramatoma25.priceWholesale,
            },
            pramatoma50: {
              cost: prices.premium.pramatoma50.cost,
              priceRetail: prices.premium.pramatoma50.priceRetail,
              priceWholesale: prices.premium.pramatoma50.priceWholesale,
            },
          },

          eco: {
            meter: {
              cost: prices.eco.meter.cost,
              priceRetail: prices.eco.meter.priceRetail,
              priceWholesale: prices.eco.meter.priceWholesale,
            },
            aklina: {
              cost: prices.eco.aklina.cost,
              priceRetail: prices.eco.aklina.priceRetail,
              priceWholesale: prices.eco.aklina.priceWholesale,
            },
            nepramatoma: {
              cost: prices.eco.nepramatoma.cost,
              priceRetail: prices.eco.nepramatoma.priceRetail,
              priceWholesale: prices.eco.nepramatoma.priceWholesale,
            },
            vidutiniska: {
              cost: prices.eco.vidutiniska.cost,
              priceRetail: prices.eco.vidutiniska.priceRetail,
              priceWholesale: prices.eco.vidutiniska.priceWholesale,
            },
            pramatoma: {
              cost: prices.eco.pramatoma.cost,
              priceRetail: prices.eco.pramatoma.priceRetail,
              priceWholesale: prices.eco.pramatoma.priceWholesale,
            },
            pramatoma25: {
              cost: prices.eco.pramatoma25.cost,
              priceRetail: prices.eco.pramatoma25.priceRetail,
              priceWholesale: prices.eco.pramatoma25.priceWholesale,
            },
            pramatoma50: {
              cost: prices.eco.pramatoma50.cost,
              priceRetail: prices.eco.pramatoma50.priceRetail,
              priceWholesale: prices.eco.pramatoma50.priceWholesale,
            },
          },
        },
      };

      const responseData = await fenceSchema.findByIdAndUpdate(_id, updatedData, {
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

  updateGateData: async (req: Request, res: Response) => {
    try {
      const data = req.body;

      const responseData = await gatePriceSchema.findByIdAndUpdate(data._id, data, {
        new: true,
      });

      if (!responseData) return response(res, false, null, "Vartai nerasti");

      emit.toAdmin("updateGateData", responseData);

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

  newFence: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      const doesExist = await fenceSchema.findOne({ name });

      if (doesExist) return response(res, false, null, "Tokia tvora jau egzistuoja");

      const newFence = new fenceSchema({ name });

      const responseData = await newFence.save();

      emit.toAdmin("newFence", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
