import projectSchema from "../schemas/projectSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";

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

      if (!data) return response(res, false, null, "Klaida saugant užsakymą");

      const responseData = { _id, status: value };

      emit.toAdmin("changeProjectStatus", responseData);

      return response(
        res,
        true,
        responseData,
        value ? "Užsakymas patvirtintas" : "Užsakymas atšauktas"
      );
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////
};
