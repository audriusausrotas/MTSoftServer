import deleteVersions from "../modules/deleteProjectVersions";
import unconfirmedSchema from "../schemas/unconfirmedSchema";
import montavimasSchema from "../schemas/installationSchema";
import deletedSchema from "../schemas/deletedSchema";
import projectSchema from "../schemas/projectSchema";
import archiveSchema from "../schemas/archiveSchema";
import backupSchema from "../schemas/backupSchema";
import { Response, Request } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";

const schemaMap = {
  archive: archiveSchema,
  unconfirmed: unconfirmedSchema,
  deleted: deletedSchema,
  backup: backupSchema,
};

type Location = keyof typeof schemaMap;

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
      const { _id, location }: { _id: string; location: Location } = req.body;

      const schema = schemaMap[location];
      if (!schema) {
        return response(res, false, null, "Klaidinga lokacija");
      }

      const data = await schema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      emit.toAdmin("archiveDeleted", { _id, location });

      return response(res, true, { _id }, "Projektas ištrintas");
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  restoreArchive: async (req: Request, res: Response) => {
    try {
      const { _id, location }: { _id: string; location: Location } = req.body;

      const schema = schemaMap[location];
      if (!schema) {
        return response(res, false, null, "Klaidinga lokacija");
      }

      const archivedProject = await schema.findById(_id);

      if (!archivedProject) return response(res, false, null, "Projektas nerastas");

      const currentDate = new Date();
      let expirationDate = new Date(currentDate);
      expirationDate.setDate(currentDate.getDate() + 30);
      const dateExparation = expirationDate.toISOString();

      archivedProject.dateExparation = dateExparation;
      const projectData = archivedProject.toObject();

      const project = new projectSchema(projectData);

      const data = await project.save();

      const deleteSchema = schemaMap[location];
      if (!schema) {
        return response(res, false, null, "Klaidinga lokacija");
      }

      await deleteSchema.findByIdAndDelete(_id);

      emit.toAdmin("archiveDeleted", { _id, location });

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

      await deleteVersions(project.versions);

      project.versions = [];

      const projectData = project.toObject();

      projectData.dateExparation = new Date().toISOString();

      const archivedProject = new archiveSchema({ ...projectData });

      const data = await archivedProject.save();

      await projectSchema.findByIdAndDelete(_id);
      await montavimasSchema.findByIdAndDelete(_id);

      emit.toAdmin("addArchive", data);

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

      await deleteVersions(project.versions);

      const projectData = project.toObject();
      const unconfirmedProject = new unconfirmedSchema({ ...projectData });
      const data = await unconfirmedProject.save();

      if (!data) return response(res, false, null, "Klaida perkeliant projektą");

      await projectSchema.findByIdAndDelete(_id);
      await backupSchema.findByIdAndDelete(_id);

      emit.toAdmin("addUnconfirmed", data);

      return response(res, true, data, "Projektas perkeltas ");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
