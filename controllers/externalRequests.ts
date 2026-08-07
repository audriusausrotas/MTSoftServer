import { Request, Response } from "express";
import response from "../modules/response";
import userSchema from "../schemas/userSchema";
import { orderFence, orderAditionalFence } from "../services/externalServices";
import scheduleSchema from "../schemas/scheduleSchema";
import productSchema from "../schemas/productSchema";
import productionSchema from "../schemas/productionSchema";

export default {
  //////////////////// get requests ////////////////////////////////////

  getManagers: async (req: Request, res: Response) => {
    try {
      const data = await userSchema.find(
        {
          verified: true,
          accountType: { $in: ["Administratorius", "Vadybininkas"] },
        },
        { username: 1, email: 1, phone: 1, _id: 1 },
      );

      if (!data) return response(res, false, null, "Vartotoji nerasti");

      return response(res, true, data);
    } catch (error: any) {
      console.error("Klaida:", error);
      return response(res, false, null, error.message);
    }
  },

  checkStatus: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;
      const production = await productionSchema.findById(_id);

      let productionData;

      if (production) {
        productionData = {
          fences: production.fences.map((fence: any) => ({
            side: fence.side,
            name: fence.name,
            color: fence.color,
            material: fence.material,
            manufacturer: fence.manufacturer,
            holes: fence.holes,
            step: fence.step,
            holesDone: fence.holesDone,

            measures: fence.measures.map((measure: any) => ({
              length: measure.length,
              height: measure.height,
              elements: measure.elements,
              cut: measure.cut,
              done: measure.done,
              holes: measure.holes,
              postone: measure.postone,
              kampas: measure.kampas,
              laiptas: measure.laiptas,
            })),
          })),

          bindings: production.bindings.map((binding: any) => ({
            name: binding.name,
            quantity: binding.quantity,
            height: binding.height,
            color: binding.color,
            cut: binding.cut,
            done: binding.done,
            postone: binding.postone,
          })),
        };
      }

      const schedules = await scheduleSchema.find({
        "jobs._id": _id,
      });

      let productionDate = "------";
      let deliveryDate = "------";

      schedules.forEach((schedule) => {
        const job = schedule.jobs.find((job: any) => job._id.toString() === _id);
        if (!job) return;

        if (schedule.worker.lastName === "Gamyba") productionDate = schedule.date;
        else deliveryDate = schedule.date;
      });

      const responseData = {
        productionData,
        dates: {
          productionDate,
          deliveryDate,
        },
      };

      console.log(responseData);

      return response(res, true, responseData);
    } catch (error: any) {
      console.error("Klaida:", error);
      return response(res, false, null, error.message);
    }
  },

  orderFence: async (req: Request, res: Response) => {
    try {
      const body = JSON.parse(req.body.data);
      const result = await orderFence(body);
      return response(res, true, result, "Tvora sėkmingai užsakyta");
    } catch (error: any) {
      console.error("Klaida:", error);
      return response(res, false, null, error.message);
    }
  },

  orderAdditionalFence: async (req: Request, res: Response) => {
    try {
      const body = JSON.parse(req.body.data);
      await orderAditionalFence(body);
      return response(res, true, null, "Papildomos detalės sėkmingai užsakytos");
    } catch (error: any) {
      console.error("Klaida:", error);
      return response(res, false, null, error.message);
    }
  },
};
