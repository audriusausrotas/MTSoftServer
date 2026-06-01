import deleteProjectVersions from "../modules/deleteProjectVersions";
import deleteVersions from "../modules/deleteProjectVersions";
import installationSchema from "../schemas/installationSchema";
import versionsSchema from "../schemas/versionsSchema";
import deletedSchema from "../schemas/deletedSchema";
import projectSchema from "../schemas/projectSchema";
import userSchema from "../schemas/userSchema";
import { Project } from "../data/interfaces";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import productionSchema from "../schemas/productionSchema";
import gateSchema from "../schemas/gateSchema";
import finishedSchema from "../schemas/finishedSchema";
import {
  changeCompletionDate,
  createProjectService,
  findProjectById,
  updateProjectStatus,
} from "../services/projectService";
import { deleteBackup } from "../services/backupServices";
import { deleteProduction } from "../services/productionService";

export default {
  //////////////////// get requests ////////////////////////////////////

  getProjects: async (req: Request, res: Response) => {
    try {
      const projects = await projectSchema.find();

      if (!projects.length) return response(res, false, null, "Projektai nerasti");

      projects.reverse();
      return response(res, true, projects, "Projektai sėkmingai gauti");
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getProjectsLight: async (req: Request, res: Response) => {
    try {
      const projects = await projectSchema
        .find(
          {},
          {
            _id: 1,
            orderNumber: 1,
            status: 1,
            priceVAT: 1,
            priceWithDiscount: 1,
            discount: 1,
            totalPrice: 1,
            "creator.username": 1,
            "client.email": 1,
            "client.address": 1,
            "client.phone": 1,
            "dates.dateCreated": 1,
            "dates.dateExparation": 1,
            "dates.dateConfirmed": 1,
          },
        )
        .sort({ _id: -1 });

      if (!projects.length) return response(res, false, null, "Projektai nerasti");

      return response(res, true, projects, "Projektai sėkmingai gauti");
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getProject: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      return response(res, true, project, "Projektas sėkmingai gautas");
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteProject: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;
      if (!_id) return response(res, false, null, "Trūksta projekto ID");

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      await deleteProjectVersions(project.versions);

      const projectData = project.toObject();

      projectData.dates.dateExparation = new Date().toISOString();

      const deletedProject = new deletedSchema({ ...projectData });
      const deletedData = await deletedProject.save();
      if (!deletedData) return response(res, false, null, "Klaida trinant projektą");

      await projectSchema.findByIdAndDelete(_id);
      await installationSchema.findByIdAndDelete(_id);

      emit.toAdmin("deleteProject", { _id });

      return response(res, true, { _id }, "Projektas ištrintas");
    } catch (error) {
      console.error("Klaida trinant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteVersion: async (req: Request, res: Response) => {
    try {
      const { _id, projectId } = req.body;

      await versionsSchema.findByIdAndDelete(_id);

      const project = await projectSchema.findById(projectId);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.versions = project.versions.filter(
        (version) => version.id.toString() !== _id.toString(),
      );

      const data = await project.save();

      if (!data) return response(res, false, null, "Klaida saugant projektą");

      const responseData = { _id, projectId };

      emit.toAdmin("deleteProjectVersion", responseData);

      return response(res, true, responseData, "Versija ištrinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  changeAdvance: async (req: Request, res: Response) => {
    const { _id, advance } = await req.body;
    try {
      const project = await findProjectById(_id);

      const afterTwoMonths = new Date();
      afterTwoMonths.setMonth(afterTwoMonths.getMonth() + 2);

      project.advance = advance;

      if (
        project.status === "Nepatvirtintas" ||
        project.status === "Tinkamas" ||
        project.status === "Netinkamas" ||
        project.status === "Matavimas" ||
        project.status === "Remontas" ||
        project.status?.toLowerCase() === "naujas užsakymas"
      ) {
        project.status = "Patvirtintas";
        if (!project.dates.dateConfirmed) project.dates.dateConfirmed = new Date().toISOString();
      }
      if (!project.dates.dateCompletion)
        project.dates.dateCompletion = afterTwoMonths.toISOString();

      const data = await project.save();
      if (!data) return response(res, false, null, "Klaida saugant projektą");

      const responseData = { _id, value: advance };

      emit.toAdmin("updateProjectAdvance", responseData);

      return response(res, true, responseData, "Avansas atnaujintas");
    } catch (error) {
      console.error("Klaida atnaujinant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  changeManager: async (req: Request, res: Response) => {
    try {
      const { _id, value } = req.body;

      const project = await findProjectById(_id);

      const users = await userSchema.find();
      let newUser = users.find((item) => item.username === value);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.creator = newUser!;
      const data = await project.save();

      if (!data) return response(res, false, null, "Klaida saugant projektą");

      const responseData = { _id, user: newUser };

      emit.toAdmin("updateProjectManager", responseData);

      return response(res, true, responseData, "Atsakingas amuo pakeistas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  extendExparationDate: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const project = await findProjectById(_id);

      const currentDate = new Date();
      let expirationDate = new Date(currentDate);
      expirationDate.setDate(currentDate.getDate() + 30);
      const dateExparation = expirationDate.toISOString();

      project.dates.dateExparation = dateExparation;

      const data = await project.save();

      if (!data) return response(res, false, null, "Klaida saugant projektą");

      const responseData = { _id, dateExparation };

      emit.toAdmin("updateProjectExparationDate", responseData);

      return response(res, true, responseData, "Galiojimo laikas pratęstas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  versionRollback: async (req: Request, res: Response) => {
    try {
      const { _id, projectId } = req.body;

      const project = await findProjectById(projectId);

      const rollbackVersion = await versionsSchema.findById(_id);

      if (!rollbackVersion) return response(res, false, null, "Projektas nerastas");

      rollbackVersion.versions = [...project.versions];

      return response(res, true, rollbackVersion);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { _id, value } = req.body;

      const responseData = await updateProjectStatus(_id, value);

      return response(res, true, responseData, "Būsena atnaujinta");
    } catch (error: any) {
      console.error("Klaida:", error);
      return response(res, false, null, error.message);
    }
  },

  partsDelivered: async (req: Request, res: Response) => {
    try {
      const { _id, measureIndex, value } = req.body;

      const project = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.results[measureIndex].delivered = value;

      const data = await project.save();

      const responseData = { _id, measureIndex, value };

      emit.toAdmin("partsDelivered", responseData);
      emit.toInstallation("partsDelivered", responseData);
      emit.toWarehouse("partsDelivered", responseData);

      return response(res, true, responseData, "Pristatymas patvirtintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  partsOrdered: async (req: Request, res: Response) => {
    try {
      const { _id, measureIndex, value } = req.body;

      const project = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.results[measureIndex].ordered = value;

      const data = await project.save();

      const responseData = { _id, measureIndex, value };

      emit.toAdmin("partsOrdered", responseData);
      emit.toInstallation("partsOrdered", responseData);
      emit.toWarehouse("partsOrdered", responseData);

      return response(res, true, responseData, "Pristatymas patvirtintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  workDone: async (req: Request, res: Response) => {
    try {
      const { _id, measureIndex, value } = req.body;

      const project = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.works[measureIndex].done = value;

      const data = await project.save();

      const responseData = { _id, measureIndex, value };

      emit.toAdmin("workDone", responseData);
      emit.toInstallation("workDone", responseData);
      emit.toWarehouse("workDone", responseData);

      return response(res, true, responseData, "Pristatymas patvirtintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addGateManufacturer: async (req: Request, res: Response) => {
    try {
      const { _id, manufacturer } = req.body;

      const project = await projectSchema.findByIdAndUpdate(_id, {
        gateManufacturer: manufacturer,
      });

      if (!project) return response(res, false, null, "Projektas nerastas");

      const responseData = { _id, manufacturer };

      emit.toAdmin("addGateManufacturer", responseData);
      emit.toInstallation("addGateManufacturer", responseData);
      emit.toWarehouse("addGateManufacturer", responseData);

      return response(res, true, responseData, "Tiekėjas pridėtas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  changeCompletionDate: async (req: Request, res: Response) => {
    try {
      const { _id, date } = req.body;

      const data = await changeCompletionDate(_id, date);

      return response(res, true, data, "Pristatymas patvirtintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  projectFinished: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const project = await projectSchema.findById(_id).lean();

      if (!project) return response(res, false, null, "Projektas nerastas");

      let dateArchieved = new Date().toISOString();

      if (project.status === "Baigtas" && project.dates.dateArchieved)
        dateArchieved = project.dates.dateArchieved;

      const archivedProject = {
        ...project,
        status: "Baigtas",
        versions: [],
        files: [],
        dates: {
          ...project.dates,
          dateArchieved: dateArchieved,
        },
      };

      await finishedSchema.create(archivedProject);

      await deleteVersions(project.versions);
      await projectSchema.deleteOne({ _id });
      await deleteBackup(_id);
      await installationSchema.deleteOne({ _id });
      await deleteProduction(_id as string);
      await gateSchema.deleteOne({ _id });

      emit.toAdmin("finishProject", { _id });

      return response(res, true, { _id }, "Būsena atnaujinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    } finally {
    }
  },

  updateProject: async (req: Request, res: Response) => {
    try {
      const {
        _id,
        client,
        fenceMeasures,
        results,
        works,
        gates,
        totalPrice,
        totalCost,
        totalProfit,
        totalMargin,
        priceVAT,
        priceWithDiscount,
        discount,
        retail,
      } = req.body;

      const today = new Date().toISOString();

      const orderExist = await projectSchema.findById(_id);

      if (!orderExist) return { success: false, data: null, message: "Projektas nerastas" };

      const versionObject: Project = orderExist.toObject();
      delete versionObject._id;

      const newVersion = new versionsSchema(versionObject);
      const version = await newVersion.save();

      if (!version) return response(res, false, null, "Klaida išsaugant versiją");

      orderExist.versions?.push({
        id: version._id,
        date: today,
      });
      orderExist.client = client;
      orderExist.fenceMeasures = fenceMeasures;
      orderExist.results = results;
      orderExist.works = works;
      orderExist.gates = gates;
      orderExist.totalPrice = totalPrice;
      orderExist.totalCost = totalCost;
      orderExist.totalProfit = totalProfit;
      orderExist.totalMargin = totalMargin;
      orderExist.priceVAT = priceVAT;
      orderExist.priceWithDiscount = priceWithDiscount;
      orderExist.discount = discount;
      orderExist.retail = retail;

      const responseData = await orderExist.save();

      emit.toAdmin("updateProject", responseData);

      return response(res, true, responseData, "Projektas išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  newProject: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      const result = await createProjectService(req.body, user);

      return response(res, true, result, "Projektas išsaugotas");
    } catch (err: any) {
      console.error("newProject error:", err);
      return response(res, false, null, err.message || "Serverio klaida");
    }
  },
};
