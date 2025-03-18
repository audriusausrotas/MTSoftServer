import { Request, Response } from "express";
import response from "../modules/response";
import productionSchema from "../schemas/productionSchema";
import { Comment, Gamyba } from "../data/interfaces";
import { HydratedDocument } from "mongoose";

export default {
  //////////////////// get requests ////////////////////////////////////

  //////////////////// delete requests /////////////////////////////////

  deleteProductionComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;
      // gali reiket konvertuot
      const data = await productionSchema.findOne(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      data.aditional = data.aditional.filter(
        (item) => item.date !== comment.date && item.comment !== comment.comment
      );

      await data.save();
      return response(res, true, data, "Komentaras ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  //////////////////// post requests ///////////////////////////////////
  addProductionComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment, username } = req.body;

      const data: HydratedDocument<Gamyba> | null =
        await productionSchema.findById(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      const newComment: Comment = {
        comment,
        date: new Date().toISOString(),
        creator: username,
      };

      data.aditional.unshift(newComment);

      await data.save();
      return response(res, true, data, "komentaras išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
