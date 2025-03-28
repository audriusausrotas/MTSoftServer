import installationSchema from "../schemas/installationSchema";
import { Installation } from "../data/interfaces";
import processJob from "../modules/processJob";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getWorks: async (req: Request, res: Response) => {
    try {
      const data: Installation[] = await installationSchema.find();

      if (!data) return response(res, false, null, "Montavimo nėra");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteInstallation: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const data = await installationSchema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "užsakymas nerastas");

      emit.toAdmin("deleteInstallationOrder", { _id });
      emit.toInstallation("deleteInstallationOrder", { _id });
      emit.toWarehouse("deleteInstallationOrder", { _id });

      return response(res, true, { _id }, "Užsakymas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteWorker: async (req: Request, res: Response) => {
    try {
      const { _id, worker } = req.body;

      const project = await installationSchema.findById(_id);

      if (!project) return response(res, false, null, "Užsakymas nerastas");

      const newWorkers = project?.workers.filter((item) => item !== worker);

      project.workers = newWorkers;

      const data = await project?.save();

      if (!data) return response(res, false, null, "Klaida trinant darbuotoją");

      const responseData = { _id, worker };

      emit.toAdmin("deleteInstallationWorker", responseData);
      emit.toWarehouse("deleteInstallationWorker", responseData);

      return response(res, true, responseData, "Daruotojas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  partsDelivered: async (req: Request, res: Response) => {
    try {
      const { _id, measureIndex, value } = req.body;

      const project = await installationSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.results[measureIndex].delivered = value;

      const data = await project.save();

      const responseData = { _id, measureIndex, value };

      emit.toAdmin("installationPartsDelivered", responseData);
      emit.toInstallation("installationPartsDelivered", responseData);
      emit.toWarehouse("installationPartsDelivered", responseData);

      return response(res, true, responseData, "Pristatymas patvirtintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updatePostone: async (req: Request, res: Response) => {
    try {
      const { _id, index, measureIndex, value } = req.body;

      const project = await installationSchema.findByIdAndUpdate(
        _id,
        {
          $set: { [`fences.${index}.measures.${measureIndex}.postone`]: value },
        },
        { new: true }
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      const responseData = { _id, index, measureIndex, value };

      emit.toAdmin("updateInstallationPostone", responseData);
      emit.toWarehouse("updateInstallationPostone", responseData);
      emit.toInstallation("updateInstallationPostone", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateInstallation: async (req: Request, res: Response) => {
    try {
      const { _id, index, measureIndex, value } = req.body;

      const project = await installationSchema.findByIdAndUpdate(
        _id,
        { $set: { [`fences.${index}.measures.${measureIndex}.done`]: value } },
        { new: true }
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      const responseData = { _id, index, measureIndex, value };

      emit.toAdmin("updateInstallationDone", responseData);
      emit.toWarehouse("updateInstallationDone", responseData);
      emit.toInstallation("updateInstallationDone", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { _id, status } = req.body;

      const data: Installation | null = await installationSchema.findByIdAndUpdate(
        _id,
        { $set: { status: status } },
        { new: true }
      );

      if (!data) return response(res, false, null, "Įvyko klaida");

      const responseData = { _id, status };

      emit.toAdmin("updateInstallationStatus", responseData);
      emit.toWarehouse("updateInstallationStatus", responseData);
      emit.toInstallation("updateInstallationStatus", responseData);

      return response(res, true, responseData, "Statusas pakeistas");
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

      emit.toAdmin("newInstallation", result.data);
      emit.toWarehouse("newInstallation", result.data);
      emit.toInstallation("newInstallation", result.data);

      return response(res, true, result.data, result.message);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
