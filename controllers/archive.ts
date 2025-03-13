import response from "../modules/response";
import deletedSchema from "../schemas/deletedSchema";
import backupSchema from "../schemas/backupSchema";
import projectSchema from "../schemas/projectSchema";
import archiveSchema from "../schemas/archiveSchema";
import unconfirmedSchema from "../schemas/unconfirmedSchema";
import montavimasSchema from "../schemas/installationSchema";
import cloudinaryBachDelete from "../utils/cloudinaryBachDelete";
import deleteVersions from "../utils/deleteProjectVersions";
import io from "../sockets/main";
import { Response, Request } from "express";

export default {
  newArchive: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const project = await projectSchema.findById({ _id });

      if (!project) return response(res, false, null, "Projektas nerastas");

      cloudinaryBachDelete(project.files);
      await deleteVersions(project.versions);

      project.versions = [];

      const projectData = project.toObject();

      projectData.dateExparation = new Date().toISOString();

      const archivedProject = new archiveSchema({ ...projectData });

      const data = await archivedProject.save();

      await projectSchema.findByIdAndDelete(_id);
      await montavimasSchema.findByIdAndDelete(_id);

      return response(res, true, data, "Projektas perkeltas į archyvą");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  restoreArchive: async (req: Request, res: Response) => {
    try {
      const { _id, location } = await req.body;

      let archivedProject = null;

      if (location === "archive") {
        archivedProject = await archiveSchema.findById(_id);
      } else if (location === "unconfirmed") {
        archivedProject = await unconfirmedSchema.findById(_id);
      } else if (location === "deleted") {
        archivedProject = await deletedSchema.findById(_id);
      } else if (location === "backup") {
        archivedProject = await backupSchema.findById(_id);
      }

      if (!archivedProject)
        if (!archivedProject)
          return response(res, false, null, "Projektas nerastas");

      const currentDate = new Date();
      let expirationDate = new Date(currentDate);
      expirationDate.setDate(currentDate.getDate() + 30);
      const dateExparation = expirationDate.toISOString();

      archivedProject.dateExparation = dateExparation;
      const projectData = archivedProject.toObject();

      const project = new projectSchema(projectData);

      const data = await project.save();

      if (location === "archive") {
        await archiveSchema.findByIdAndDelete({ _id });
      } else if (location === "unconfirmed") {
        await unconfirmedSchema.findByIdAndDelete({ _id });
      } else if (location === "deleted") {
        await deletedSchema.findByIdAndDelete({ _id });
      } else if (location === "backup") {
        await backupSchema.findByIdAndDelete({ _id });
      }

      return response(res, true, data, "Projektas perkeltas į projektus");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteArchive: async (req: Request, res: Response) => {
    try {
      const { _id, location } = await req.body;

      if (location === "archive") {
        await archiveSchema.findOneAndDelete({ _id });
      } else if (location === "unconfirmed") {
        await unconfirmedSchema.findOneAndDelete({ _id });
      } else if (location === "deleted") {
        await deletedSchema.findOneAndDelete({ _id });
      } else if (location === "backup") {
        await deletedSchema.findOneAndDelete({ _id });
      }

      return response(res, true, null, "Projektas ištrintas");
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getArchives: async (req: Request, res: Response) => {
    try {
      const data = await archiveSchema.find();

      if (!data) return response(res, false, null, "Projektai nerasti");

      data.reverse();

      const lightData = data.map((item) => {
        return {
          _id: item._id,
          orderNumber: item.orderNumber,
          client: item.client,
          priceVAT: item.priceVAT,
          priceWithDiscount: item.priceWithDiscount,
          status: item.status,
          discount: item.discount,
        };
      });
      return response(res, true, lightData, "");
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getArchive: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;
      if (!_id) return response(res, false, null, "Trūksta projekto ID");

      let project = await archiveSchema.findById(_id);

      if (!project) {
        project = await unconfirmedSchema.findById(_id);
      }

      if (!project) {
        project = await deletedSchema.findById(_id);
      }

      if (!project) {
        project = await backupSchema.findById(_id);
      }

      if (!project) return response(res, false, null, "Projektas nerastas");

      return response(res, true, project, "Projektas rastas");
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
