import { Response, Request } from "express";
import productionSchema from "../schemas/productionSchema";
import response from "../modules/response";
import { Gamyba } from "../data/interfaces";
import { v4 as uuidv4 } from "uuid";
import { HydratedDocument } from "mongoose";
import cloudinaryBachDelete from "../modules/cloudinaryBachDelete";
import projectSchema from "../schemas/projectSchema";

// pridet checka ar useris yra adminas

export default {
  getProduction: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const data: Gamyba | null = await productionSchema.findById(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getProductions: async (req: Request, res: Response) => {
    try {
      const data: Gamyba[] | null = await productionSchema.find();

      if (!data.length) return response(res, false, null, "Projektai nerasti");

      const lightData = data.map((item) => {
        return {
          _id: item._id,
          client: { address: item.client.address },
          creator: { username: item.creator.username },
          orderNumber: item.orderNumber,
          status: item.status,
        };
      });

      return response(res, true, lightData);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteProduction: async (req: Request, res: Response) => {
    try {
      const { _id, completed } = req.body;

      const data = await productionSchema.findOneAndDelete(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      cloudinaryBachDelete(data.files);

      if (completed) {
        const project = await projectSchema.findById(_id);

        if (!project) return response(res, false, null, "Projektas nerastas");

        project.status = "Pagamintas";
        project.save();
      }

      return response(res, true, null, "Užsakymas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addBinding: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { _id } = req.params;
      // gali reiket konvertuot i objekta
      const order: HydratedDocument<Gamyba> | null =
        await productionSchema.findById(_id);

      if (!order) return response(res, false, null, "užsakymas nerastas");

      const newBinding = {
        id: uuidv4(),
        type: undefined,
        height: undefined,
        quantity: undefined,
        color: undefined,
        cut: undefined,
        done: undefined,
        postone: false,
      };

      order.bindings?.push(newBinding);
      const data = await order.save();
      return response(res, true, data, "Apkaustas pridėtas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updatePostone: async (res: Response, req: Request) => {
    try {
      const { _id, index, measureIndex, value, option } = req.body;

      let updatePath = "";
      if (option === "bindings") updatePath = `bindings.${index}.postone`;
      else updatePath = `fences.${index}.measures.${measureIndex}.postone`;

      // gali reiket _id konvertuot i objekta

      const project = await productionSchema.findOneAndUpdate(
        { _id: _id },
        { $set: { [updatePath]: value } },
        { new: true }
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      return response(res, true, project);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteBindings: async (res: Response, req: Request) => {
    try {
      const { _id, bindingId, userId } = req.body;

      // gali nerast nes ne objectId, gali reikt konvertuot.
      const order = await productionSchema.findById(_id);

      if (!order) return response(res, false, null, "Užsakymas nerastas");

      order!.bindings = order.bindings!.filter((item) => item.id !== bindingId);

      const data = await order.save();

      return response(res, true, data, "Apkaustas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
