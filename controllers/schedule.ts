import { Job, Schedule } from "../data/interfaces";
import scheduleSchema from "../schemas/scheduleSchema";
import processJob from "../modules/processJob";
import userSchema from "../schemas/userSchema";
import { Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getSchedules: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;

      if (!user) return response(res, false, null, "Klaidingas vartotojas");

      const today = new Date();

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 14);

      const oneMonthAhead = new Date();
      oneMonthAhead.setMonth(today.getMonth() + 1);

      let schedule: Schedule[] = [];

      if (
        user.accountType === "Administratorius" ||
        user.accountType === "Gamyba" ||
        user.accountType === "Sandėlys"
      ) {
        schedule = await scheduleSchema.find();
      } else if (user.accountType === "Montavimas") {
        schedule = await scheduleSchema.find({
          "worker.lastName": user.lastName,
        });
      }

      const filtered = schedule.filter((s: any) => {
        const parsedDate = new Date(s.date);
        return parsedDate >= twoWeeksAgo && parsedDate <= oneMonthAhead;
      });

      if (filtered.length === 0)
        return response(res, false, null, "Grafikas nerastas");

      return response(res, true, filtered);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  //////////////////// update requests /////////////////////////////////

  //////////////////// post requests ///////////////////////////////////

  addSchedule: async (req: Request, res: Response) => {
    try {
      const { date, comment, selectedJobs, worker } = req.body;

      // delete if no comment or job is passed
      if (comment.trim() === "" && selectedJobs.length === 0) {
        const existingSchedule = await scheduleSchema.findOneAndDelete({
          date,
          worker,
        });

        if (!existingSchedule)
          return response(res, false, null, "Klaida saugant");

        const responseData = { date, worker };

        emit.toAdmin("deleteSchedule", responseData);
        emit.toInstallation("deleteSchedule", responseData);
        emit.toProduction("deleteSchedule", responseData);
        emit.toWarehouse("deleteSchedule", responseData);

        return response(res, true, responseData, "Išsaugota");
      }

      const workerFound = await userSchema.findById(worker._id);
      if (!workerFound)
        return response(res, false, null, "Darbuotojas nerastas");

      if (workerFound.accountType !== "Gamyba") {
        selectedJobs.forEach(async (job: Job) => {
          await processJob(job._id, worker.lastName, res);
        });
      }

      const existingSchedule = await scheduleSchema.findOne({ date, worker });

      if (existingSchedule) {
        existingSchedule.comment = comment || "";
        existingSchedule.jobs = selectedJobs;

        const responseData = await existingSchedule.save();

        emit.toAdmin("updateSchedule", responseData);
        emit.toInstallation("updateSchedule", responseData);
        emit.toProduction("updateSchedule", responseData);
        emit.toWarehouse("updateSchedule", responseData);

        return response(res, true, responseData, "Išsaugota");
      } else {
        const newSchedule = new scheduleSchema({
          date,
          comment: comment || "",
          jobs: selectedJobs,
          worker,
        });

        const responseData = await newSchedule.save();

        emit.toAdmin("newSchedule", responseData);
        emit.toInstallation("newSchedule", responseData);
        emit.toProduction("newSchedule", responseData);
        emit.toWarehouse("newSchedule", responseData);

        return response(res, true, responseData, "Išsaugota");
      }
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
