import projectSchema from "../schemas/projectSchema";
import type { Comment } from "../data/interfaces";
import gateSchema from "../schemas/gateSchema";
import { Request, Response } from "express";
import response from "../modules/response";

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

  // getGate: async (req: Request, res: Response) => {
  //   try {
  //     const { _id } = req.params;

  //     const gate = await gateSchema.findById(_id);

  //     if (!gate) return response(res, false, null, "Užsakymas nerastas");

  //     return response(res, true, gate);
  //   } catch (error) {
  //     console.error("Klaida:", error);
  //     return response(res, false, null, "Serverio klaida");
  //   }
  // },

  //////////////////// delete requests /////////////////////////////////
  cancelOrder: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const data = await gateSchema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "Serverio klaida");

      return response(res, true, null, "Vartų užsakymas atšauktas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
  //////////////////// update requests /////////////////////////////////

  finishOrder: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      await projectSchema.findByIdAndUpdate(_id, { status: "Vartai Sumontuoti" });

      const data = await gateSchema.findByIdAndUpdate(_id, { measure: "Baigtas" });

      if (!data) return response(res, false, null, "Serverio klaida");

      return response(res, true, null, "Užsakymas baigtas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateOrder: async (req: Request, res: Response) => {
    try {
      const { _id, change, value } = req.body;

      const user = res.locals.user;

      const data = await gateSchema.findById(_id);

      if (!data) return response(res, false, null, "Serverio klaida");

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

      await data.save();

      return response(res, false, null, "Būsena atnaujinta");
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

      if (project.gates.length === 0) return response(res, false, null, "Projektas vartų neturi");

      const gates = await gateSchema.find();

      const gatesExist = gates.some((item) => item._id.toString() === project._id.toString());

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

      const data = await newGates.save();

      return response(res, true, data, "Vartai užsakyti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
