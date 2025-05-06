import deleteProjectVersions from "../modules/deleteProjectVersions";
import deleteVersions from "../modules/deleteProjectVersions";
import unconfirmedSchema from "../schemas/unconfirmedSchema";
import installationSchema from "../schemas/installationSchema";
import versionsSchema from "../schemas/versionsSchema";
import deletedSchema from "../schemas/deletedSchema";
import projectSchema from "../schemas/projectSchema";
import backupSchema from "../schemas/backupSchema";
import bonusSchema from "../schemas/bonusSchema";
import generateHTML from "../modules/generateHTML";
import sendEmail from "../modules/sendEmail";
import userSchema from "../schemas/userSchema";
import { Project } from "../data/interfaces";
import { HydratedDocument } from "mongoose";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import productionSchema from "../schemas/productionSchema";
import gateSchema from "../schemas/gateSchema";
import finishedSchema from "../schemas/finishedSchema";

export default {
  //////////////////// get requests ////////////////////////////////////

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
      const { _id } = req.params;

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektai nerasti");

      return response(res, true, project, "Prisijungimas sėkmingas");
    } catch (error) {
      console.error("Klaida gaunant projektus:", error);
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

  removeUnconfirmed: async (req: Request, res: Response) => {
    try {
      return response(res, true, null, "Nepatvirtinti projektai ištrinti");
    } catch (error) {
      console.error("Klaida:", error);
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
        (version) => version.id.toString() !== _id.toString()
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
      const project = await projectSchema.findById(_id);

      if (!project)
        return {
          success: false,
          data: null,
          message: "Projektas nerastas",
        };

      const afterTwoMonths = new Date();
      afterTwoMonths.setMonth(afterTwoMonths.getMonth() + 2);

      project.advance = advance;
      project.status = "Patvirtintas";
      project.dates.dateConfirmed = new Date().toISOString();
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

      const project = await projectSchema.findById(_id);
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

      const project: HydratedDocument<Project> | null = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

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

      const project = await projectSchema.findById(projectId);

      if (!project) return response(res, false, null, "Projektas nerastas");

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

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      project.status = value;

      if (value === "Patvirtintas") {
        const afterTwoMonths = new Date();
        afterTwoMonths.setMonth(afterTwoMonths.getMonth() + 2);

        project.dates.dateConfirmed = new Date().toISOString();
        project.dates.dateCompletion = afterTwoMonths.toISOString();

        const backupProject = await backupSchema.findById(_id);
        if (!backupProject) {
          const projectData = project.toObject();
          const newBackup = new backupSchema(projectData);
          await newBackup.save();
        }
      }

      const data = await project.save();
      if (!data) return response(res, true, null, "Serverio klaida");

      if (value === "Apmokėjimas") {
        const html = generateHTML(project);

        await sendEmail({
          to: "vaida@modernitvora.lt",
          subject: "Baigtas objektas",
          user: project.creator,
          html,
        });
      }

      const responseData = { _id, status: value };

      emit.toAdmin("changeProjectStatus", responseData);

      return response(res, true, responseData, "Būsena atnaujinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
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

  changeCompletionDate: async (req: Request, res: Response) => {
    try {
      const { _id, date } = req.body;

      const project = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.dates.dateCompletion = date;

      const data = await project.save();
      const responseData = { _id, date };

      emit.toAdmin("changeCompletionDate", responseData);
      emit.toInstallation("changeCompletionDate", responseData);
      emit.toWarehouse("changeCompletionDate", responseData);

      return response(res, true, responseData, "Pristatymas patvirtintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  projectFinished: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const project = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      const currentDate = new Date().toISOString();

      await deleteVersions(project.versions);

      project.versions = [];
      project.status = "Baigtas";

      const newProject = project.toObject();

      newProject.dates.dateArchieved = currentDate;

      const finishedProject = new finishedSchema(newProject);

      const data = await finishedProject.save();

      if (!data) response(res, false, null, "Klaida išsaugant projektą");

      const bonus = new bonusSchema({
        address: project.client.address,
        dateFinished: currentDate,
        price: project.totalPrice,
        cost: project.totalCost,
        profit: project.totalProfit,
        margin: project.totalMargin,
        user: project.creator.username,
      });

      await projectSchema.findByIdAndDelete(_id);
      await backupSchema.findByIdAndDelete(_id);
      await installationSchema.findByIdAndDelete(_id);
      await productionSchema.findByIdAndDelete(_id);
      await gateSchema.findByIdAndDelete(_id);
      await bonus.save();

      const responseData = { _id, data };

      emit.toAdmin("finishProject", responseData);

      return response(res, true, responseData, "Būsena atnaujinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
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
        confirmed,
        payed,
        status,
        advance,
        retail,
      } = await req.body;

      const user = res.locals.user;

      const creator = {
        username: user.username,
        lastName: user.lastname,
        email: user.email,
        phone: user.phone,
      };

      let projectExist = null;

      if (_id) projectExist = await projectSchema.findById(_id);

      const creatorUsername = projectExist ? projectExist.creator.username : creator.username;

      const currentDate = new Date();

      const dateCreated = currentDate.toISOString();

      let expirationDate = new Date(currentDate);
      expirationDate.setDate(currentDate.getDate() + 30);

      const dateExparation = expirationDate.toISOString();

      const firstThreeLetters = creatorUsername.substring(0, 3).toUpperCase();
      let newOrderNumbers = "0001";

      const userProjects = await projectSchema.find({
        $and: [
          { "creator.username": creatorUsername },
          { orderNumber: { $regex: `^${firstThreeLetters}`, $options: "i" } },
        ],
      });

      if (userProjects.length > 0) {
        function extractOrderNumber(item: any) {
          return parseInt(item.orderNumber.split("-")[1], 10);
        }

        const sortedOrderNumbers = userProjects.sort(
          (a, b) => extractOrderNumber(a) - extractOrderNumber(b)
        );

        let lastOrder = sortedOrderNumbers[sortedOrderNumbers.length - 1]?.orderNumber;

        let orderNumbers = +lastOrder.split("-")[1];
        orderNumbers++;

        newOrderNumbers = orderNumbers.toString().padStart(4, "0");
      }

      const orderNumber = `${firstThreeLetters}-${newOrderNumbers}`;

      if (projectExist) {
        const newProjectData = projectExist.toObject() as Project;

        delete newProjectData._id;
        newProjectData.dates.dateCreated = dateCreated;
        newProjectData.orderNumber = orderNumber;
        newProjectData.dates.dateExparation = dateExparation;
        newProjectData.status = "Nepatvirtintas";
        newProjectData.advance = 0;
        newProjectData.versions = [];

        const newProject = new projectSchema(newProjectData);
        const responseData = await newProject.save();

        emit.toAdmin("newProject", responseData);

        return response(res, true, responseData, "Projektas nukopijuotas");
      } else {
        const dates = {
          dateCreated,
          dateExparation,
          dateConfirmed: "",
          dateCompletion: "",
          dateArchieved: "",
        };

        const project = new projectSchema({
          creator,
          client,
          fenceMeasures,
          results,
          orderNumber,
          works,
          gates,
          totalPrice,
          totalCost,
          totalProfit,
          totalMargin,
          priceVAT,
          priceWithDiscount,
          discount,
          confirmed,
          payed,
          status,
          advance,
          dates,
          retail,
        });

        const responseData = await project.save();

        emit.toAdmin("newProject", responseData);

        return response(res, true, responseData, "Projektas išsaugotas");
      }
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
