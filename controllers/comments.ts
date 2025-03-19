import { Comment, Gamyba, Montavimas, Project } from "../data/interfaces";
import installationSchema from "../schemas/installationSchema";
import productionSchema from "../schemas/productionSchema";
import projectSchema from "../schemas/projectSchema";
import { Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import response from "../modules/response";

export default {
  //////////////////// get requests ////////////////////////////////////

  //////////////////// delete requests /////////////////////////////////

  deleteProductionComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

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

  deleteInstallationComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

      const data = await installationSchema.findById(_id);

      if (!data) return response(res, false, null, "užsakymas nerastas");

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

  deleteProjectComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

      const data = await projectSchema.findById(_id);

      if (!data) return { success: false, data: null, message: "užsakymas nerastas" };

      data.comments = data.comments.filter(
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
      const { _id, comment } = req.body;

      const user = res.locals.user;

      const data: HydratedDocument<Gamyba> | null = await productionSchema.findById(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      const newComment: Comment = {
        comment,
        date: new Date().toISOString(),
        creator: user.username,
      };

      data.aditional.unshift(newComment);

      await data.save();
      return response(res, true, data, "komentaras išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addInstallationComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

      const user = res.locals.user;

      const data: HydratedDocument<Montavimas> | null = await installationSchema.findById(_id);

      if (!data) return response(res, false, null, "Montavimas nerastas");

      const newComment: Comment = {
        comment,
        date: new Date().toISOString(),
        creator: user.username,
      };

      data.aditional.unshift(newComment);

      await data.save();

      return response(res, true, data, "Komentaras išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addProjectComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

      const user = res.locals.user;

      const data: HydratedDocument<Project> | null = await projectSchema.findById(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      const newComment: Comment = {
        comment,
        date: new Date().toISOString(),
        creator: user.username,
      };

      data.comments.unshift(newComment);

      const savedData = await data.save();

      return response(res, true, savedData, "Komentaras išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
