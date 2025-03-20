import deleteProjectVersions from "../modules/deleteProjectVersions";
import cloudinaryBachDelete from "../modules/cloudinaryBachDelete";
import deleteVersions from "../modules/deleteProjectVersions";
import unconfirmedSchema from "../schemas/unconfirmedSchema";
import montavimasSchema from "../schemas/installationSchema";
import versionsSchema from "../schemas/versionsSchema";
import deletedSchema from "../schemas/deletedSchema";
import projectSchema from "../schemas/projectSchema";
import backupSchema from "../schemas/backupSchema";
import bonusSchema from "../schemas/bonusSchema";
import { sendEmail } from "../modules/helpers";
import userSchema from "../schemas/userSchema";
import { Project } from "../data/interfaces";
import { HydratedDocument } from "mongoose";
import { Request, Response } from "express";
import response from "../modules/response";
import io from "../sockets/main";

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

  // getProject: async (req: Request, res: Response) => {
  //   try {
  //     const { _id } = req.params;
  //     if (!_id) return response(res, false, null, "Trūksta projekto ID");

  //     const project = await projectSchema.findById(_id);
  //     if (!project) return response(res, false, null, "Projektas nerastas");

  //     return response(res, true, project, "Projektas rastas");
  //   } catch (error) {
  //     console.error("Klaida gaunant projektą:", error);
  //     return response(res, false, null, "Serverio klaida");
  //   }
  // },

  //////////////////// delete requests /////////////////////////////////

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
      if (!deletedData) return response(res, false, null, "Klaida trinant projektą");

      await projectSchema.findByIdAndDelete(_id);
      await montavimasSchema.findByIdAndDelete(_id);

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
        if (project.status === "Nepatvirtintas" || project.status === "Netinkamas") {
          const expirationDate = new Date(project.dateExparation);

          if (currentDate > expirationDate) {
            await cloudinaryBachDelete(project.files);
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

      const newProject = await project.save();

      return response(res, true, newProject, "Versija ištrinta");
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

  changeManager: async (req: Request, res: Response) => {
    try {
      const { _id, value } = req.body;

      const project = await projectSchema.findById(_id);
      const users = await userSchema.find();
      let newUser = users.find((item) => item.username === value);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.creator = newUser!;
      const data = await project.save();

      return response(res, true, data, "Atsakingas amuo pakeistas");
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

      project.dateExparation = dateExparation;

      const data = await project.save();

      return response(res, true, data, "Galiojimo laikas pratęstas");
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
        let comments = project.comments
          .map(
            (comment) => `
        <tr>
          <td>${comment.date.slice(0, 16).replace("T", " ")}</td>
          <td>${comment.creator}</td>
          <td>${comment.comment}</td>
    
    
        </tr>`
          )
          .join("");

        let materialsList = project.results
          .map(
            (result) => `
        <tr>
          <td>${result.type}</td>
          <td>${result.color}</td>
          <td>${result.quantity}</td>
          <td>${result.cost} €</td>
          <td>${result.price} €</td>
          <td>${result.totalCost} €</td>
          <td>${result.totalPrice} €</td>
        </tr>`
          )
          .join("");

        let workList = project.works
          .map(
            (result) => `
        <tr>
          <td>${result.name}</td>
          <td>${result.quantity}</td>
          <td>${result.cost} €</td>
          <td>${result.price} €</td>
          <td>${result.totalCost} €</td>
          <td>${result.totalPrice} €</td>
        </tr>`
          )
          .join("");

        let html = `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
          }
          h2 {
            color: #333;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .info-table, .finance-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .info-table th, .info-table td,
          .finance-table th, .finance-table td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          .info-table th, .finance-table th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
          .highlight {
            font-weight: bold;
            color: #2c3e50;
          }
        </style>
      </head>
      <body>
        
        <h2>Baigtas objektas</h2>
    
        <table class="info-table">
          <tr>
            <th>Klientas</th>
            <td>${project.client.username}</td>
          </tr>
          <tr>
            <th>Adresas</th>
            <td>${project.client.address}</td>
          </tr>
          <tr>
            <th>Telefono numeris</th>
            <td>${project.client.phone}</td>
          </tr>
          <tr>
            <th>Elektroninio pašto adresas</th>
            <td>${project.client.email}</td>
          </tr>
          <tr>
            <th>Objektą administravo</th>
            <td>${project.creator.username}</td>
          </tr>
        </table>
    
        <h2>Komentarai</h2>
        <table class="info-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Autorius</th>
              <th>Komentaras</th>
            </tr>
          </thead>
          <tbody>
            ${comments}
          </tbody>
        </table>
    
        <h2>Medžiagos</h2>
        <table class="info-table">
          <thead>
            <tr>
              <th>Pavadinimas</th>
              <th>Spalva</th>
              <th>Kiekis</th>
              <th>Savikaina</th>
              <th>Kaina</th>
              <th>Savikaina viso</th>
              <th>Kaina viso</th>
            </tr>
          </thead>
          <tbody>
            ${materialsList}
          </tbody>
        </table>
    
        <h2>Darbai</h2>
        <table class="info-table">
          <thead>
            <tr>
              <th>Pavadinimas</th>
              <th>Kiekis</th>
              <th>Savikaina</th>
              <th>Kaina</th>
              <th>Savikaina viso</th>
              <th>Kaina viso</th>
            </tr>
          </thead>
          <tbody>
            ${workList}
          </tbody>
        </table>
    
        <h2>Finansinė informacija</h2>
        <table class="finance-table">
          <tr>
            <th>Projekto savikaina</th>
            <td class="highlight">${project.totalCost} €</td>
          </tr>
          <tr>
            <th>Projekto Kaina</th>
            <td class="highlight">${project.totalPrice} €</td>
          </tr>
          <tr>
            <th>Paliktas avansas</th>
            <td class="highlight">${project.advance} €</td>
          </tr>
          <tr>
            <th>Galutinė kaina klientui</th>
            <td class="highlight">${
              project.discount ? project.priceWithDiscount : project.priceVAT
            } €</td>
          </tr>
          <tr>
            <th>Atsiskaityti likę</th>
            <td class="highlight">${
              project.discount
                ? project.priceWithDiscount - project.advance
                : project.priceVAT - project.advance
            } €</td>
          </tr>
        </table>
    
      </body>
      </html>
    `;

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
          if (!bonusData) return response(res, true, null, "Klaida išsaugant bonusus");
        }
      }

      return response(res, true, data, "Būsena atnaujinta");
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

      if (!orderExist) return { success: false, data: null, message: "Projektas nerastas" };

      const versionObject: Project = orderExist.toObject();
      delete versionObject._id;

      const newVersion = new versionsSchema(versionObject);
      const version = await newVersion.save();

      if (!version) return response(res, false, null, "Klaida išsaugant versiją");

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

      const data = await orderExist.save();
      return response(res, true, data, "Projektas išsaugotas");
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

      let projectExist = null;

      if (_id) projectExist = await projectSchema.findById(_id);

      const user = res.locals.user;

      const creator = {
        username: user.username,
        lastName: user.lastname,
        email: user.email,
        phone: user.phone,
      };

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

        let orderNumbers = parseInt(lastOrder.split("-")[1]);
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

        const data = await project.save();

        return response(res, true, data, "Projektas išsaugotas");
      }
    } catch (error) {
      console.error("Klaida gaunant projektą:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
