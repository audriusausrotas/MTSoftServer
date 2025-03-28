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

export default {
  //////////////////// get requests ////////////////////////////////////

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

  //////////////////// delete requests /////////////////////////////////

  deleteProject: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;
      if (!_id) return response(res, false, null, "Trūksta projekto ID");

      const project = await projectSchema.findById(_id);
      if (!project) return response(res, false, null, "Projektas nerastas");

      await deleteProjectVersions(project.versions);

      const projectData = project.toObject();

      projectData.dateExparation = new Date().toISOString();

      const deletedProject = new deletedSchema({ ...projectData });
      const deletedData = await deletedProject.save();
      if (!deletedData)
        return response(res, false, null, "Klaida trinant projektą");

      await projectSchema.findByIdAndDelete(_id);
      await installationSchema.findByIdAndDelete(_id);

      emit.toAdmin("deleteProject", { _id });

      return response(res, true, null, "Projektas ištrintas");
    } catch (error) {
      console.error("Klaida trinant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  removeUnconfirmed: async (req: Request, res: Response) => {
    try {
      const projects = await projectSchema.find();
      if (!projects.length) return response(res, true, null, "Projektų nėra");

      const currentDate = new Date();

      const deletionPromises = projects.map(async (project) => {
        if (
          project.status === "Nepatvirtintas" ||
          project.status === "Netinkamas"
        ) {
          const expirationDate = new Date(project.dateExparation);

          if (currentDate > expirationDate) {
            await deleteVersions(project.versions);

            const projectData = project.toObject();
            const unconfirmedProject = new unconfirmedSchema({
              ...projectData,
            });
            await unconfirmedProject.save();

            await projectSchema.findByIdAndDelete(project._id);
            await backupSchema.findByIdAndDelete(project._id);
          }
        }
      });

      await Promise.all(deletionPromises);

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

      project.advance = advance;
      project.status = "Patvirtintas";

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

      const project: HydratedDocument<Project> | null =
        await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      const currentDate = new Date();
      let expirationDate = new Date(currentDate);
      expirationDate.setDate(currentDate.getDate() + 30);
      const dateExparation = expirationDate.toISOString();

      project.dateExparation = dateExparation;

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

      if (!rollbackVersion)
        return response(res, false, null, "Projektas nerastas");

      rollbackVersion.versions = [...project.versions];

      return response(res, true, rollbackVersion);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addFiles: async (req: Request, res: Response) => {
    try {
      const { _id, files } = req.body;

      const project = await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.files.push(...files);

      const data = await project.save();

      if (!data) return response(res, false, null, "Klaida saugant projektą");

      const responseData = { _id, files };

      emit.toAdmin("updateProjectAddFiles", responseData);

      return response(res, true, responseData, "Failai sėkmingai įkelti");
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
      const data = await project.save();

      if (!data) return response(res, true, null, "Serverio klaida");

      if (value === "Patvirtintas") {
        const backupProject = await backupSchema.findById(_id);
        if (!backupProject) {
          const projectData = data.toObject();
          const newBackup = new backupSchema(projectData);
          await newBackup.save();
        }
      }

      if (value === "Apmokėjimas") {
        const html = generateHTML(project);

        const emailResult = await sendEmail({
          to: "vaida@modernitvora.lt",
          subject: "Baigtas objektas",
          user: project.creator,
          html,
        });
      }

      if (value === "Baigtas") {
        await backupSchema.findByIdAndDelete(_id);

        if (project.creator.username === "Audrius") {
          const currentDate = new Date();
          const dateFinished = currentDate.toISOString();

          const bonus = new bonusSchema({
            address: project.client.address,
            dateFinished: dateFinished,
            price: project.totalPrice,
            cost: project.totalCost,
            profit: project.totalProfit,
            margin: project.totalMargin,
            bonus: Math.round(project.totalProfit * 0.03),
          });

          const bonusData = await bonus.save();
          if (!bonusData)
            return response(res, true, null, "Klaida išsaugant bonusus");
        }
      }

      const responseData = { _id, status: value };

      emit.toAdmin("changeProjectStatus", responseData);

      if (value === "Baigtas") emit.toAdmin("finishProject", { _id });

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

      const currentDate = new Date();

      const dateCreated = currentDate.toISOString();
      let expirationDate = new Date(currentDate);
      expirationDate.setDate(currentDate.getDate() + 30);
      const dateExparation = expirationDate.toISOString();

      const orderExist = await projectSchema.findById(_id);

      if (!orderExist)
        return { success: false, data: null, message: "Projektas nerastas" };

      const versionObject: Project = orderExist.toObject();
      delete versionObject._id;

      const newVersion = new versionsSchema(versionObject);
      const version = await newVersion.save();

      if (!version)
        return response(res, false, null, "Klaida išsaugant versiją");

      orderExist.versions?.push({
        id: version._id,
        date: dateCreated,
      });
      orderExist.dateCreated = dateCreated;
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
      orderExist.dateExparation = dateExparation;
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

      const creatorUsername = projectExist
        ? projectExist.creator.username
        : creator.username;

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

        let lastOrder =
          sortedOrderNumbers[sortedOrderNumbers.length - 1]?.orderNumber;

        let orderNumbers = +lastOrder.split("-")[1];
        orderNumbers++;

        newOrderNumbers = orderNumbers.toString().padStart(4, "0");
      }

      const orderNumber = `${firstThreeLetters}-${newOrderNumbers}`;

      if (projectExist) {
        const newProjectData = projectExist.toObject() as Project;

        delete newProjectData._id;
        newProjectData.dateCreated = dateCreated;
        newProjectData.orderNumber = orderNumber;
        newProjectData.dateExparation = dateExparation;
        newProjectData.status = "Nepatvirtintas";
        newProjectData.advance = 0;
        newProjectData.versions = [];

        const newProject = new projectSchema(newProjectData);
        const data = await newProject.save();

        return response(res, true, data, "Projektas nukopijuotas");
      } else {
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
          dateCreated,
          dateExparation,
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
