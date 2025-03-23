import projectSchema from "../schemas/projectSchema";
import { Request, Response } from "express";
import response from "../modules/response";

export default {
  //////////////////// get requests ////////////////////////////////////

  getOrder: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const data = await projectSchema.findById(_id);

      if (!data) return response(res, false, null, "Užsakymas nerastas");

      return response(res, true, data, "Užsakymas rastas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////
  //////////////////// update requests /////////////////////////////////

  changeOrderStatus: async (req: Request, res: Response) => {
    try {
      const { _id, value } = req.params;

      const order: any = await projectSchema.findById(_id);

      if (!order) return response(res, false, null, "Užsakymas nerastas");

      order.confirmed = value;
      order.status = value ? "Tinkamas" : "Netinkamas";

      const data = await order.save();

      return response(res, true, data, value ? "Užsakymas patvirtintas" : "Užsakymas atšauktas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////
};
