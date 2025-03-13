import response from "../modules/response";
import deletedSchema from "../schemas/deletedSchema";
import montavimasSchema from "../schemas/installationSchema";
import projectSchema from "../schemas/projectSchema";
import io from "../sockets/main";
import { Request, Response } from "express";
import cloudinaryBachDelete from "../utils/cloudinaryBachDelete";
import deleteProjectVersions from "../utils/deleteProjectVersions";

export default {
  newProject: async (req: Request, res: Response) => {
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
      const { _id } = req.params;
      if (!_id) return response(res, false, null, "Trūksta projekto ID");

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      cloudinaryBachDelete(project.files);
      await deleteProjectVersions(project.versions);

      const projectData = project.toObject();
      projectData.dateExparation = new Date().toISOString();

      const deletedProject = new deletedSchema({ ...projectData });
      const deletedData = await deletedProject.save();
      if (!deletedData)
        return response(res, false, null, "Klaida trinant projektą");

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
      if (!projects.length)
        return response(res, false, null, "Projektai nerasti");

      projects.reverse();
      return response(res, true, projects, "Prisijungimas sėkmingas");
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getProject: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;
      if (!_id) return response(res, false, null, "Trūksta projekto ID");

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      return response(res, true, project, "Projektas rastas");
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  changeAdvance: async (req: Request, res: Response) => {
    const { _id, advance } = await req.body;
    try {
      const project = await projectSchema.findById({ _id });

      if (!project)
        return {
          success: false,
          data: null,
          message: "Projektas nerastas.",
        };

      project.advance = advance;
      project.status = "Patvirtintas";

      const data = await project.save();
      return response(res, false, data, "Avansas atnaujintas");
    } catch (error) {
      console.error("Klaida atnaujinant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  // temp: async (req: Request, res: Response) => {
  //   const { _id, advance } = await req.body;
  //   try {
  //     const project = await projectSchema.findById({ _id });

  //     if (!project)
  //       return {
  //         success: false,
  //         data: null,
  //         message: "Projektas nerastas.",
  //       };

  //     project.advance = advance;
  //     project.status = "Patvirtintas";

  //     const data = await project.save();
  //     return response(res, false, null, "Serverio klaida");
  //   } catch (error) {
  //     console.error("Klaida atnaujinant projektą:", error);
  //     return response(res, false, null, "Serverio klaida");
  //   }
  // },
};
