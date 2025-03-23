import cloudinaryBachDelete from "../modules/cloudinaryBachDelete";
import deleteVersions from "../modules/deleteProjectVersions";
import unconfirmedSchema from "../schemas/unconfirmedSchema";
import montavimasSchema from "../schemas/installationSchema";
import deletedSchema from "../schemas/deletedSchema";
import projectSchema from "../schemas/projectSchema";
import archiveSchema from "../schemas/archiveSchema";
import backupSchema from "../schemas/backupSchema";
import { Response, Request } from "express";
import response from "../modules/response";
import io from "../sockets/main";

export default {
  //////////////////// get requests ////////////////////////////////////

  getArchive: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      let data = await archiveSchema.findById(_id);
      if (!data) data = await unconfirmedSchema.findById(_id);
      if (!data) data = await deletedSchema.findById(_id);

      if (!data) return response(res, false, null, "Projektai nerasti");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getArchives: async (req: Request, res: Response) => {
    try {
      const data = await archiveSchema.aggregate([
        { $sort: { dateExparation: -1 } },
        {
          $project: {
            _id: 1,
            orderNumber: 1,
            client: 1,
            priceVAT: 1,
            priceWithDiscount: 1,
            status: 1,
            discount: 1,
          },
        },
      ]);

      if (!data) return response(res, false, null, "Projektai nerasti");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getBackup: async (req: Request, res: Response) => {
    try {
      const data = await backupSchema.aggregate([
        { $sort: { dateExparation: -1 } },
        {
          $project: {
            _id: 1,
            orderNumber: 1,
            client: 1,
            priceVAT: 1,
            priceWithDiscount: 1,
            status: 1,
            discount: 1,
          },
        },
      ]);

      if (!data) return response(res, false, null, "Projektai nerasti");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getUnconfirmed: async (req: Request, res: Response) => {
    try {
      const data = await unconfirmedSchema.aggregate([
        { $sort: { dateExparation: -1 } },
        {
          $project: {
            _id: 1,
            orderNumber: 1,
            client: 1,
            priceVAT: 1,
            priceWithDiscount: 1,
            status: 1,
            discount: 1,
          },
        },
      ]);

      if (!data) return response(res, false, null, "Projektai nerasti");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getDeleted: async (req: Request, res: Response) => {
    try {
      const data = await deletedSchema.aggregate([
        { $sort: { dateExparation: -1 } },
        {
          $project: {
            _id: 1,
            orderNumber: 1,
            client: 1,
            priceVAT: 1,
            priceWithDiscount: 1,
            status: 1,
            discount: 1,
          },
        },
      ]);

      if (!data) return response(res, false, null, "Projektai nerasti");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  serviceSearch: async (req: Request, res: Response) => {
    try {
      const query = req.query;
      const search = query.q as string;

      if (!search || search.length < 3) return { results: [] };

      const results = await archiveSchema
        .find(
          {
            $and: [
              {
                $or: [
                  { "client.address": { $regex: search, $options: "i" } },
                  { "client.username": { $regex: search, $options: "i" } },
                  { "client.phone": { $regex: search, $options: "i" } },
                  { "client.email": { $regex: search, $options: "i" } },
                ],
              },
              { gates: { $exists: true, $ne: [] } },
              { status: "Baigtas" },
            ],
          },
          {
            "client.address": 1,
            dateExparation: 1,
          }
        )
        .limit(10)
        .lean();

      return response(res, true, results);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteArchive: async (req: Request, res: Response) => {
    try {
      const { _id, location } = await req.body;

      if (location === "archive") {
        await archiveSchema.findByIdAndDelete(_id);
      } else if (location === "unconfirmed") {
        await unconfirmedSchema.findByIdAndDelete(_id);
      } else if (location === "deleted") {
        await deletedSchema.findByIdAndDelete(_id);
      } else if (location === "backup") {
        await deletedSchema.findByIdAndDelete(_id);
      }

      return response(res, true, null, "Projektas ištrintas");
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteDeleted: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;
      const data = await deletedSchema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      return response(res, true, null, "Projektas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteUnconfirmed: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;
      const data = await unconfirmedSchema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      cloudinaryBachDelete(data.files);

      return response(res, true, null, "Projektas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

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
        if (!archivedProject) return response(res, false, null, "Projektas nerastas");

      const currentDate = new Date();
      let expirationDate = new Date(currentDate);
      expirationDate.setDate(currentDate.getDate() + 30);
      const dateExparation = expirationDate.toISOString();

      archivedProject.dateExparation = dateExparation;
      const projectData = archivedProject.toObject();

      const project = new projectSchema(projectData);

      const data = await project.save();

      if (location === "archive") {
        await archiveSchema.findByIdAndDelete(_id);
      } else if (location === "unconfirmed") {
        await unconfirmedSchema.findByIdAndDelete(_id);
      } else if (location === "deleted") {
        await deletedSchema.findByIdAndDelete(_id);
      } else if (location === "backup") {
        await backupSchema.findByIdAndDelete(_id);
      }

      return response(res, true, data, "Projektas perkeltas į projektus");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  addArchive: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const project = await projectSchema.findById(_id);

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

  addUnconfirmed: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      await cloudinaryBachDelete(project.files);
      await deleteVersions(project.versions);

      const projectData = project.toObject();
      const unconfirmedProject = new unconfirmedSchema({ ...projectData });
      const savedData = await unconfirmedProject.save();

      if (!savedData) return response(res, false, null, "Klaida perkeliant projektą");

      await projectSchema.findByIdAndDelete(_id);
      await backupSchema.findByIdAndDelete(_id);

      return response(res, true, savedData, "Projektas perkeltas ");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
