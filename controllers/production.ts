import { Response, Request } from "express";
import productionSchema from "../schemas/productionSchema";
import response from "../modules/response";
import { Gamyba } from "../data/interfaces";
import { v4 as uuidv4 } from "uuid";
import { HydratedDocument } from "mongoose";

// pridet checka ar useris yra adminas

export default {
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
