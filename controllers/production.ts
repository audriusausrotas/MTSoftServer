import { Prodution } from "../data/interfaces";
import productionSchema from "../schemas/productionSchema";
import { HydratedDocument } from "mongoose";
import { Response, Request } from "express";
import response from "../modules/response";
import { v4 as uuidv4 } from "uuid";
import emit from "../sockets/emits";

import { newProductionService } from "../services/productionService";

// pridet checka ar useris yra adminas

export default {
  //////////////////// get requests ///////////////////////////////////

  getProductions: async (req: Request, res: Response) => {
    try {
      const data: Prodution[] | null = await productionSchema.find();

      if (!data.length) return response(res, false, null, "Projektai nerasti");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getProduction: async (req: Request, res: Response) => {
    const { _id } = req.params;

    try {
      const data: Prodution | null = await productionSchema.findById(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      return response(res, true, data);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests ///////////////////////////////////

  deleteProduction: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const data = await productionSchema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "Projektas nerastas");

      emit.toAdmin("deleteProduction", { _id });
      emit.toProduction("deleteProduction", { _id });
      emit.toWarehouse("deleteProduction", { _id });
      emit.toInstallation("deleteProduction", { _id });

      return response(res, true, { _id }, "Užsakymas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteBindings: async (req: Request, res: Response) => {
    try {
      const { _id, bindingId } = req.body;

      const order = await productionSchema.findById(_id);

      if (!order) return response(res, false, null, "Užsakymas nerastas");

      order!.bindings = order.bindings!.filter((item) => item.id !== bindingId);

      await order.save();

      const responseData = { _id, bindingId };

      emit.toAdmin("deleteProductionBinding", responseData);
      emit.toProduction("deleteProductionBinding", responseData);
      emit.toWarehouse("deleteProductionBinding", responseData);
      emit.toInstallation("deleteProductionBinding", responseData);

      return response(res, true, responseData, "Apkaustas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteFence: async (req: Request, res: Response) => {
    try {
      const { _id, index } = req.body;

      const project = await productionSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.fences = project.fences.filter((fence, i) => i !== index);

      await project.save();

      const responseData = { _id, index };

      emit.toAdmin("deleteProductionFence", responseData);
      emit.toProduction("deleteProductionFence", responseData);
      emit.toWarehouse("deleteProductionFence", responseData);
      emit.toInstallation("deleteProductionFence", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteMeasure: async (req: Request, res: Response) => {
    try {
      const { _id, index, measureIndex } = req.body;

      const project = await productionSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      project.fences[index].measures = project.fences[index].measures.filter(
        (item, index) => index !== measureIndex,
      );

      const data = await project.save();

      const responseData = { _id, index, measureIndex };

      emit.toAdmin("deleteProductionMeasure", responseData);
      emit.toProduction("deleteProductionMeasure", responseData);
      emit.toWarehouse("deleteProductionMeasure", responseData);
      emit.toInstallation("deleteProductionMeasure", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests ///////////////////////////////////

  updatePostone: async (req: Request, res: Response) => {
    try {
      const { _id, index, measureIndex, value, option } = req.body;

      let updatePath = "";
      if (option === "bindings") updatePath = `bindings.${index}.postone`;
      else updatePath = `fences.${index}.measures.${measureIndex}.postone`;

      const project = await productionSchema.findByIdAndUpdate(
        _id,
        { $set: { [updatePath]: value } },
        { new: true },
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      const responseData = { _id, index, measureIndex, value, option };

      emit.toAdmin("updateProductionPostone", responseData);
      emit.toProduction("updateProductionPostone", responseData);
      emit.toWarehouse("updateProductionPostone", responseData);
      emit.toInstallation("updateProductionPostone", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { _id, status } = req.body;

      const data: Prodution | null = await productionSchema.findByIdAndUpdate(
        _id,
        { $set: { status: status } },
        { new: true },
      );

      if (!data) return response(res, false, null, "Serverio klaida");

      const responseData = { _id, status };

      emit.toAdmin("updateProductionStatus", responseData);
      emit.toProduction("updateProductionStatus", responseData);
      emit.toWarehouse("updateProductionStatus", responseData);

      return response(res, true, responseData, "Statusas pakeistas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateMeasure: async (req: Request, res: Response) => {
    try {
      const { _id, index, measureIndex, value, field, option } = req.body;

      let updatePath = "";

      if (option === "bindings") updatePath = `bindings.${index}.${field}`;
      else updatePath = `fences.${index}.measures.${measureIndex}.${field}`;

      const project = await productionSchema.findByIdAndUpdate(
        _id,
        { $set: { [updatePath]: value } },
        { new: true },
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      const responseData = { _id, index, measureIndex, value, field, option };

      emit.toAdmin("updateProductionMeasure", responseData);
      emit.toProduction("updateProductionMeasure", responseData);
      emit.toWarehouse("updateProductionMeasure", responseData);
      emit.toInstallation("updateProductionMeasure", responseData);

      return response(res, true, responseData, "issaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateFence: async (req: Request, res: Response) => {
    try {
      const { _id, index, side, color, name, manufacturer, material, holes, step } = req.body;

      const project = await productionSchema.findByIdAndUpdate(
        _id,
        {
          $set: {
            [`fences.${index}.side`]: side,
            [`fences.${index}.color`]: color,
            [`fences.${index}.name`]: name,
            [`fences.${index}.manufacturer`]: manufacturer,
            [`fences.${index}.material`]: material,
            [`fences.${index}.holes`]: holes,
            [`fences.${index}.step`]: step,
          },
        },
        { new: true },
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      const responseData = { _id, index, side, color, name, manufacturer, material, holes, step };

      emit.toAdmin("updateProductionFence", responseData);
      emit.toProduction("updateProductionFence", responseData);
      emit.toWarehouse("updateProductionFence", responseData);
      emit.toInstallation("updateProductionFence", responseData);

      return response(res, true, responseData, "išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateGate: async (req: Request, res: Response) => {
    try {
      const { _id, index, measureIndex, value } = req.body;

      let updatePath = `fences.${index}.measures.${measureIndex}.gates.exist`;

      const project = await productionSchema.findByIdAndUpdate(
        _id,
        { $set: { [updatePath]: value } },
        { new: true },
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      const responseData = { _id, index, measureIndex, value };

      emit.toAdmin("updateProductionGate", responseData);
      emit.toProduction("updateProductionGate", responseData);
      emit.toWarehouse("updateProductionGate", responseData);
      emit.toInstallation("updateProductionGate", responseData);

      return response(res, true, responseData, "issaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  addNewProduction: async (req: Request, res: Response) => {
    try {
      const { number, address, creator } = req.body;

      const client = { address, username: "", phone: "", email: "" };
      const creatorNew = {
        username: creator,
        lastName: "",
        email: "",
        phone: "",
      };

      const newProdution = new productionSchema({
        creator: creatorNew,
        client,
        orderNumber: number || "",
        status: "Negaminti",
      });

      const responseData = await newProdution.save();

      if (!responseData) return response(res, false, null, "Įvyko klaida");

      emit.toAdmin("newProduction", responseData);
      emit.toProduction("newProduction", responseData);
      emit.toWarehouse("newProduction", responseData);

      return response(res, true, responseData, "Užsakymas sukurtas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addBinding: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const order: HydratedDocument<Prodution> | null = await productionSchema.findById(_id);

      if (!order) return response(res, false, null, "užsakymas nerastas");

      const newBinding = {
        id: uuidv4(),
        name: undefined,
        height: undefined,
        quantity: undefined,
        color: undefined,
        cut: undefined,
        done: undefined,
        postone: false,
      };

      order.bindings?.push(newBinding);

      const data = await order.save();

      const responseData = { _id, data: newBinding };

      emit.toAdmin("newProductionBinding", responseData);
      emit.toProduction("newProductionBinding", responseData);
      emit.toWarehouse("newProductionBinding", responseData);
      emit.toInstallation("newProductionBinding", responseData);

      return response(res, true, responseData, "Apkaustas pridėtas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addMeasure: async (req: Request, res: Response) => {
    try {
      const { _id, index } = req.body;

      const project: HydratedDocument<Prodution> | null = await productionSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      const newMeasure = {
        length: 0,
        height: 0,
        MeasureSpace: 0,
        elements: 0,
        gates: {
          exist: false,
          name: "",
          automatics: "",
          comment: "",
          direction: "",
          lock: "",
          bankette: "",
          option: "",
          installation: "",
        },
        cut: 0,
        done: 0,
        postone: false,
        kampas: {
          exist: false,
          value: 0,
          comment: "",
        },
        laiptas: {
          exist: false,
          value: 0,
          direction: "",
        },
      };

      project.fences[index].measures.push(newMeasure);

      const data = await project.save();

      if (!data) return response(res, false, null, "Klaida išsaugant duomenis");

      const responseData = { _id, index, newMeasure };

      emit.toAdmin("newProductionMeasure", responseData);
      emit.toProduction("newProductionMeasure", responseData);
      emit.toWarehouse("newProductionMeasure", responseData);
      emit.toInstallation("newProductionMeasure", responseData);

      return response(res, true, responseData, "issaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  newProduction: async (req: Request, res: Response) => {
    try {
      const result = await newProductionService(req.params._id as string);
      return response(res, true, result, "Perduota gamybai");
    } catch (err: any) {
      return response(res, false, null, err.message);
    }
  },
};
