import { Comment, Gamyba, Montavimas, Project } from "../data/interfaces";
import installationSchema from "../schemas/installationSchema";
import productionSchema from "../schemas/productionSchema";
import projectSchema from "../schemas/projectSchema";
import { Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  //////////////////// delete requests /////////////////////////////////

  deleteProductionComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

      const project = await productionSchema.findOne(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.aditional = project.aditional.filter(
        (item) => item.date !== comment.date && item.comment !== comment.comment
      );

      const data = await project.save();
      if (!data) return response(res, false, null, "Klaida trinant komentarą");

      const responseData = { _id, comment };

      emit.toAdmin("deleteProductionComment", responseData);
      emit.toInstallation("deleteProductionComment", responseData);
      emit.toWarehouse("deleteProductionComment", responseData);

      return response(res, true, responseData, "Komentaras ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteInstallationComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

      const project = await installationSchema.findById(_id);

      if (!project) return response(res, false, null, "užsakymas nerastas");

      project.aditional = project.aditional.filter(
        (item) => item.date !== comment.date && item.comment !== comment.comment
      );

      const data = await project.save();
      if (!data) return response(res, false, null, "Klaida trinant komentarą");

      const responseData = { _id, comment };

      emit.toAdmin("deleteInstallationComment", responseData);
      emit.toInstallation("deleteInstallationComment", responseData);
      emit.toWarehouse("deleteInstallationComment", responseData);

      return response(res, true, responseData, "Komentaras ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteProjectComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

      const project = await projectSchema.findById(_id);

      if (!project) return { success: false, project: null, message: "užsakymas nerastas" };

      project.comments = project.comments.filter(
        (item) => item.date !== comment.date && item.comment !== comment.comment
      );

      const data = await project.save();
      if (!data) return response(res, false, null, "Klaida trinant komentarą");

      const responseData = { _id, comment };

      emit.toAdmin("deleteProjectComment", responseData);
      emit.toInstallation("deleteProjectComment", responseData);
      emit.toWarehouse("deleteProjectComment", responseData);

      return response(res, true, responseData, "Komentaras ištrintas");
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

      const project: HydratedDocument<Gamyba> | null = await productionSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      const newComment: Comment = {
        comment,
        date: new Date().toISOString(),
        creator: user.username,
      };

      project.aditional.unshift(newComment);

      const data = await project.save();
      if (!data) return response(res, false, null, "Klaida saugant komentarą");

      const responseData = { _id, comment };

      emit.toAdmin("newProductionComment", responseData);
      emit.toInstallation("newProductionComment", responseData);
      emit.toWarehouse("newProductionComment", responseData);

      return response(res, true, responseData, "komentaras išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addInstallationComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

      const user = res.locals.user;

      const project: HydratedDocument<Montavimas> | null = await installationSchema.findById(_id);

      if (!project) return response(res, false, null, "Montavimas nerastas");

      const newComment: Comment = {
        comment,
        date: new Date().toISOString(),
        creator: user.username,
      };

      project.aditional.unshift(newComment);

      await project.save();

      const data = await project.save();
      if (!data) return response(res, false, null, "Klaida saugant komentarą");

      const responseData = { _id, comment };

      emit.toAdmin("newInstallationComment", responseData);
      emit.toInstallation("newInstallationComment", responseData);
      emit.toWarehouse("newInstallationComment", responseData);

      return response(res, true, responseData, "Komentaras išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addProjectComment: async (req: Request, res: Response) => {
    try {
      const { _id, comment } = req.body;

      const user = res.locals.user;

      const project: HydratedDocument<Project> | null = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      const newComment: Comment = {
        comment,
        date: new Date().toISOString(),
        creator: user.username,
      };

      project.comments.unshift(newComment);

      const data = await project.save();
      if (!data) return response(res, false, null, "Klaida saugant komentarą");

      const responseData = { _id, comment };

      emit.toAdmin("newProjectComment", responseData);
      emit.toInstallation("newProjectComment", responseData);
      emit.toWarehouse("newProjectComment", responseData);

      return response(res, true, responseData, "Komentaras išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
