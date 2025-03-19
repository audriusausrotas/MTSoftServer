import { Job, Schedule, SelectValues } from "../data/interfaces";
import scheduleSchema from "../schemas/scheduleSchema";
import { processJob } from "../modules/helpers";
import userSchema from "../schemas/userSchema";
import { Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import response from "../modules/response";
import io from "../sockets/main";

export default {
  //////////////////// get requests ////////////////////////////////////

  getSchedules: async (req: Request, res: Response) => {
    try {
      // reikia ID is middleware
      let _id;

      const user = await userSchema.findById(_id);

      if (!user) return response(res, false, null, "Klaidingas varotojas");

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

      if (schedule.length === 0)
        return response(res, false, null, "Grafikas nerastas");

      return response(res, true, schedule);
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

      if (comment.trim() === "" && selectedJobs.length === 0) {
        const existingSchedule = await scheduleSchema.findOneAndDelete({
          date,
          worker,
        });
        if (existingSchedule) return response(res, true, null, "Išsaugota");
        else return response(res, false, null, "Klaida saugant");
      }

      const workerFound = await userSchema.findById(worker._id);
      if (!workerFound)
        return response(res, false, null, "Darbuotojas nerastas");

      if (workerFound.accountType !== "Gamyba") {
        selectedJobs.forEach(async (job: Job) => {
          await processJob(job._id.toString(), worker.lastName, res);
        });
      }

      const existingSchedule = await scheduleSchema.findOne({ date, worker });
      if (existingSchedule) {
        existingSchedule.comment = comment;
        existingSchedule.jobs = selectedJobs;
        const data = await existingSchedule.save();

        return response(res, true, data);
      } else {
        const newSchedule = new scheduleSchema({
          date,
          comment,
          jobs: selectedJobs,
          worker,
        });

        const data = await newSchedule.save();

        return response(res, true, data, "Išsaugota");
      }
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
