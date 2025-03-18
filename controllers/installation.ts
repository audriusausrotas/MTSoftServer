import { Request, Response } from "express";
import installationSchema from "../schemas/installationSchema";
import response from "../modules/response";
import { Montavimas } from "../data/interfaces";
import cloudinaryBachDelete from "../modules/cloudinaryBachDelete";
import { processJob } from "../modules/helpers";

export default {
  //////////////////// get requests ////////////////////////////////////

  getWorks: async (req: Request, res: Response) => {
    try {
      const data: Montavimas[] = await installationSchema.find();

      if (!data) return response(res, false, null, "Montavimo nėra");

      const lightData = data.map((item) => {
        return {
          _id: item._id,
          client: { address: item.client.address },
          creator: { username: item.creator.username },
          orderNumber: item.orderNumber,
          status: item.status,
          workers: [...item.workers],
          fences: {},
          results: {},
          works: {},
          aditional: {},
          files: {},
        };
      });

      return response(res, false, lightData);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getWork: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const data: Montavimas | null = await installationSchema.findById(_id);

      if (!data) return response(res, false, null, "Darbų nėra");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteWork: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const data = await installationSchema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "užsakymas nerastas");

      cloudinaryBachDelete(data.files);

      return response(res, true, null, "Užsakymas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteWorker: async (req: Request, res: Response) => {
    try {
      const { _id, worker } = req.body;

      const data = await installationSchema.findById(_id);

      if (!data) return response(res, false, null, "Užsakymas nerastas");

      const newWorkers = data?.workers.filter((item) => item !== worker);

      data.workers = newWorkers;

      const newData = await data?.save();

      return response(res, true, newData, "Daruotojas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  partsDelivered: async (req: Request, res: Response) => {
    try {
      const { _id, measureIndex, value } = req.body;

      const data = await installationSchema.findById(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      data.results[measureIndex].delivered = value;

      const newData = await data.save();

      return response(res, true, newData, "Pristatymas patvirtintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updatePostone: async (req: Request, res: Response) => {
    try {
      const { _id, index, measureIndex, value } = req.body;

      const project = await installationSchema.findOneAndUpdate(
        { _id },
        { $set: { [`fences.${index}.measures.${measureIndex}.postone`]: value } },
        { new: true }
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      return response(res, true, project, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateInstallation: async (req: Request, res: Response) => {
    try {
      const { _id, index, measureIndex, value } = req.body;

      const project = await installationSchema.findOneAndUpdate(
        { _id },
        { $set: { [`fences.${index}.measures.${measureIndex}.done`]: value } },
        { new: true }
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      return response(res, true, project, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { _id, status } = req.body;

      const data: Montavimas | null = await installationSchema.findOneAndUpdate(
        { _id },
        { $set: { status: status } },
        { new: true }
      );

      if (!data) return response(res, false, null, "Įvyko klaida");

      return response(res, true, data, "Statusas pakeistas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  addInstallation: async (req: Request, res: Response) => {
    try {
      const { _id, worker } = req.body;

      const result = await processJob(_id, worker, res);

      if (!result.success) {
        return response(res, false, null, result.message);
      }
      return response(res, true, result.data, result.message);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
