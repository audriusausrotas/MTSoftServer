import response from "../modules/response";
import deletedSchema from "../schemas/deletedSchema";
import montavimasSchema from "../schemas/montavimasSchema";
import projectSchema from "../schemas/projectSchema";
import io from "../sockets/main";
import { Request, Response } from "express";
require("dotenv").config();

interface RegisterRequestBody {
  email: string;
  password: string;
  retypePassword: string;
  username: string;
}

export default {
  newProject: async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    try {
      const {} = req.body;

      return response(res, true, null, "");
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateProject: async (req: Request, res: Response) => {},

  deleteProject: async (req: Request, res: Response) => {
    try {
      const { _id } = req.body;
      if (!_id) return response(res, false, null, "Trūksta projekto ID");

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      // cloudinaryBachDelete(project.files);
      // await deleteVersions(project.versions);

      const projectData = project.toObject();
      projectData.dateExparation = new Date().toISOString();

      const deletedProject = new deletedSchema({ ...projectData });
      const deletedData = await deletedProject.save();
      if (!deletedData) return response(res, false, null, "Klaida trinant projektą");

      await projectSchema.findByIdAndDelete(_id);
      await montavimasSchema.findByIdAndDelete(_id);

      return response(res, true, null, "Projektas ištrintas");
    } catch (error) {
      console.error("Klaida trinant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getProjects: async (req: Request, res: Response) => {
    try {
      const projects = await projectSchema.find();
      if (!projects.length) return response(res, false, null, "Projektai nerasti");

      projects.reverse();
      return response(res, true, projects, "Prisijungimas sėkmingas");
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getProject: async (req: Request, res: Response) => {
    try {
      const { _id } = req.body;
      if (!_id) return response(res, false, null, "Trūksta projekto ID");

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      return response(res, true, project, "Projektas rastas");
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  advance: async (req: Request, res: Response) => {
    try {
      const { _id, advance } = req.body;
      if (!_id) return response(res, false, null, "Trūksta projekto ID");

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      return response(res, true, project, "Projektas rastas");
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
