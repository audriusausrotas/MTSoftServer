import projectSchema from "../schemas/projectSchema";
import type { Comment } from "../data/interfaces";
import gateSchema from "../schemas/gateSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getGates: async (req: Request, res: Response) => {
    try {
      const data = await gateSchema.find();

      if (!data) return response(res, false, null, "Vartai nerasti");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////
  cancelOrder: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const data = await gateSchema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "Serverio klaida");

      emit.toAdmin("cancelGateOrder", { _id });
      emit.toGates("cancelGateOrder", { _id });

      return response(res, true, { _id }, "Vartų užsakymas atšauktas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  finishOrder: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      await projectSchema.findByIdAndUpdate(_id, {
        status: "Vartai Sumontuoti",
      });

      const responseData = await gateSchema.findByIdAndUpdate(_id, {
        measure: "Baigtas",
      });

      if (!responseData) return response(res, false, null, "Serverio klaida");

      responseData.measure = "Baigtas";

      emit.toAdmin("changeProjectStatus", { _id, status: "Vartai Sumontuoti" });
      emit.toAdmin("updateGateOrder", responseData);
      emit.toGates("updateGateOrder", responseData);

      return response(res, true, responseData, "Užsakymas baigtas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
  //////////////////// update requests /////////////////////////////////

  updateOrder: async (req: Request, res: Response) => {
    try {
      const { _id, change, value } = req.body;

      const user = res.locals.user;

      const data = await gateSchema.findById(_id);

      if (!data) return response(res, false, null, "Užsakymas nerastas");

      switch (change) {
        case "status":
          data.measure = value;
          break;
        case "orderNr":
          data.orderNr = value;
          break;
        case "manager":
          data.manager = value;
          break;
        case "comment":
          const newComment: Comment = {
            comment: value as string,
            date: new Date().toISOString(),
            creator: user.username,
          };
          data.comments.unshift(newComment);
          break;
        case "deleteComment":
          data.comments = data.comments.filter(
            (item) => item.date !== value.date && item.comment !== value.comment
          );
          break;
        default:
          return response(res, false, null, "Nežinoma pakeitimo rūšis");
      }

      const responseData = await data.save();

      emit.toAdmin("updateGateOrder", responseData);
      emit.toGates("updateGateOrder", responseData);

      return response(res, true, responseData, "Būsena atnaujinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  newOrder: async (req: Request, res: Response) => {
    try {
      const { _id, manager } = req.body;

      const project = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      if (project.gates.length === 0)
        return response(res, false, null, "Projektas vartų neturi");

      const gates = await gateSchema.find();

      const gatesExist = gates.some(
        (item) => item._id.toString() === project._id.toString()
      );

      if (gatesExist) return response(res, false, null, "Vartai jau užsakyti");

      const currentDate = new Date();
      const dateCreated = currentDate.toISOString();

      const gateData = {
        _id: project._id,
        creator: { ...project.creator },
        client: { ...project.client },
        gates: [...project.gates],
        manager,
        dateCreated,
      };

      const newGates = new gateSchema(gateData);

      const responseData = await newGates.save();

      emit.toAdmin("newGateOrder", responseData);
      emit.toGates("newGateOrder", responseData);

      return response(res, true, responseData, "Vartai užsakyti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
