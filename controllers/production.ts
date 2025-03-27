import { Bindings, Gamyba, GamybaFence, Project } from "../data/interfaces";
import productionSchema from "../schemas/productionSchema";
import projectSchema from "../schemas/projectSchema";
import { HydratedDocument } from "mongoose";
import { Response, Request } from "express";
import response from "../modules/response";
import { v4 as uuidv4, v4 } from "uuid";
import emit from "../sockets/emits";

// pridet checka ar useris yra adminas

export default {
  //////////////////// get requests ///////////////////////////////////

  getProduction: async (req: Request, res: Response) => {
    try {
      const data: Gamyba[] | null = await productionSchema.find();

      if (!data.length) return response(res, false, null, "Projektai nerasti");

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
        (item, index) => index !== measureIndex
      );

      const data = await project.save();

      const responseData = { _id, index, measureIndex };

      emit.toAdmin("deleteProductionMeasure", responseData);
      emit.toProduction("deleteProductionMeasure", responseData);
      emit.toWarehouse("deleteProductionMeasure", responseData);

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
        { new: true }
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      const responseData = { _id, index, measureIndex, value, option };

      emit.toAdmin("updateProductionPostone", responseData);
      emit.toProduction("updateProductionPostone", responseData);
      emit.toWarehouse("updateProductionPostone", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { _id, status } = req.body;

      const data: Gamyba | null = await productionSchema.findByIdAndUpdate(
        _id,
        { $set: { status: status } },
        { new: true }
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
        { new: true }
      );

      if (!project) return response(res, false, null, "Projektas nerastas");

      const responseData = { _id, index, measureIndex, value, field, option };

      emit.toAdmin("updateProductionMeasure", responseData);
      emit.toProduction("updateProductionMeasure", responseData);
      emit.toWarehouse("updateProductionMeasure", responseData);

      return response(res, true, responseData, "issaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  addNewGamyba: async (req: Request, res: Response) => {
    try {
      const { number, address, creator } = req.body;

      const client = { address, username: "", phone: "", email: "" };
      const creatorNew = {
        username: creator,
        lastName: "",
        email: "",
        phone: "",
      };

      const newGamyba = new productionSchema({
        creator: creatorNew,
        client,
        orderNumber: number || "",
        status: "Negaminti",
      });

      const responseData = await newGamyba.save();

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

      const order: HydratedDocument<Gamyba> | null =
        await productionSchema.findById(_id);

      if (!order) return response(res, false, null, "užsakymas nerastas");

      const newBinding = {
        id: uuidv4(),
        type: undefined,
        height: undefined,
        quantity: undefined,
        color: undefined,
        cut: undefined,
        done: undefined,
        postone: false,
      };

      order.bindings?.push(newBinding);

      const data = await order.save();

      const responseData = { _id, data };

      emit.toAdmin("newProduction", responseData);
      emit.toProduction("newProduction", responseData);
      emit.toWarehouse("newProduction", responseData);

      return response(res, true, responseData, "Apkaustas pridėtas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  addMeasure: async (req: Request, res: Response) => {
    try {
      const { _id, index } = req.body;

      const project: HydratedDocument<Gamyba> | null =
        await productionSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      const newMeasure = {
        length: 0,
        height: 0,
        MeasureSpace: 0,
        elements: 0,
        gates: {
          exist: false,
          type: "",
          automatics: "",
          aditional: "",
          direction: "",
          lock: "",
          bankette: "",
          option: "",
        },
        cut: 0,
        done: 0,
        postone: false,
        kampas: {
          exist: false,
          value: 0,
          aditional: "",
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

      emit.toAdmin("newProduction", responseData);
      emit.toProduction("newProduction", responseData);
      emit.toWarehouse("newProduction", responseData);

      return response(res, true, responseData, "issaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  newProduction: async (req: Request, res: Response) => {
    const fenceBoards = [
      "Tvoralentė Alba",
      "Tvoralentė Standard",
      "Tvoralentė Sigma",
      "Tvoralentė Astra",
      "Tvoralentė Polo",
      "Tvoralentė EVA",
      "Tvoralentė EVA3",
      "Tvoralentė Estetic",
      "Tvoralentė Emka",
    ];

    try {
      const { _id } = req.params;

      const project: HydratedDocument<Project> | null =
        await projectSchema.findById(_id);

      if (!project) return response(res, false, null, "Projektas nerastas");

      const gamybaList: Gamyba[] = await productionSchema.find();

      const gamybaExist = gamybaList.some(
        (item) => item._id.toString() === project._id!.toString()
      );

      if (gamybaExist)
        return response(res, false, null, "Objektas jau gaminamas");
      else {
        //main bindings array
        const bindings: Bindings[] = [];

        //adds bindings as new or update quantity of existing
        const addBindings = (
          color: string,
          height: number,
          type: string,
          quantity: number
        ) => {
          let found = false;
          for (const binding of bindings) {
            if (
              binding.color === color &&
              binding.height === height &&
              binding.type === type
            ) {
              binding.quantity = binding.quantity! + quantity;
              found = true;
              break;
            }
          }

          if (!found) {
            bindings.push({
              id: v4(),
              color,
              height,
              type,
              quantity,
              cut: undefined,
              done: undefined,
              postone: false,
            });
          }
          found = false;
        };

        //loops via fences
        project.fenceMeasures.forEach((item) => {
          if (item.type === "Segmentas" || fenceBoards.includes(item.type))
            return;

          const color = item.color;
          const isBindings = item.bindings === "Taip" ? true : false;
          const legWidth = item.type.includes("Dilė")
            ? "20 mm"
            : item.type.includes("40/105")
            ? "40 mm"
            : "55 mm";
          let lastHeight = 0;
          let stepHeight = 0;
          let stepDirection = "";
          let cornerRadius = 0;
          let wasGates = false;
          let wasCorner = false;
          let wasStep = false;

          item.measures.forEach((measure, index) => {
            const notSpecial =
              !measure.laiptas.exist &&
              !measure.kampas.exist &&
              !measure.gates.exist;

            if (!isBindings) {
              if (notSpecial)
                addBindings(
                  color,
                  measure.height,
                  "Koja Dviguba " + legWidth,
                  2
                );
            } else {
              // if first element is fence, adds one leg
              if (index === 0) {
                if (notSpecial) {
                  lastHeight = measure.height;
                  addBindings(
                    color,
                    measure.height,
                    "Koja vienguba " + legWidth,
                    1
                  );
                } else {
                  if (measure.laiptas.exist) wasStep = true;
                  if (measure.kampas.exist) wasCorner = true;
                  if (measure.gates.exist) wasGates = true;
                }
                return;
              }

              if (index === item.measures.length - 1) {
                if (notSpecial)
                  addBindings(
                    color,
                    measure.height,
                    "Koja vienguba " + legWidth,
                    1
                  );
              }

              if (measure.gates.exist) {
                if (index !== 0 && !wasGates) {
                  const maxHeight = Math.max(lastHeight, measure.height);

                  addBindings(color, maxHeight, "Koja vienguba " + legWidth, 1);
                  isBindings && addBindings(color, maxHeight, "Elka", 2);
                }
                wasGates = true;
                if (index === 0) lastHeight = measure.height;
              } else if (measure.kampas.exist) {
                cornerRadius = measure.kampas.value;
                wasCorner = true;
              } else if (measure.laiptas.exist) {
                stepDirection = measure.laiptas.direction;
                stepHeight = measure.laiptas.value;
                wasStep = true;
              } else {
                if (wasGates) {
                  const maxHeight = Math.max(lastHeight, measure.height);

                  addBindings(color, maxHeight, "Koja vienguba " + legWidth, 1);

                  isBindings && addBindings(color, maxHeight, "Elka", 2);

                  wasGates = false;
                  lastHeight = measure.height;
                } else if (wasCorner && wasStep) {
                  const maxHeight =
                    stepDirection === "Aukštyn"
                      ? lastHeight + stepHeight - (lastHeight - measure.height)
                      : measure.height +
                        stepHeight -
                        (measure.height - lastHeight);

                  isBindings &&
                    addBindings(color, maxHeight, "Kampas " + cornerRadius, 1);

                  addBindings(color, maxHeight, "Koja vienguba " + legWidth, 1);
                  addBindings(
                    color,
                    stepDirection === "Aukštyn" ? measure.height : lastHeight,
                    "Koja vienguba " + legWidth,
                    1
                  );

                  wasCorner = false;
                  wasStep = false;
                  lastHeight = measure.height;
                } else if (wasCorner) {
                  const maxHeight = Math.max(lastHeight, measure.height);
                  isBindings &&
                    addBindings(color, maxHeight, "Kampas " + cornerRadius, 1);

                  addBindings(
                    color,
                    maxHeight,
                    "Koja vienguba " + legWidth,

                    2
                  );

                  wasCorner = false;
                  lastHeight = measure.height;
                } else if (wasStep) {
                  const maxHeight =
                    stepDirection === "Aukštyn"
                      ? lastHeight + stepHeight - (lastHeight - measure.height)
                      : measure.height +
                        stepHeight -
                        (measure.height - lastHeight);

                  isBindings && addBindings(color, maxHeight, "Centrinis", 2);

                  addBindings(color, maxHeight, "Koja vienguba " + legWidth, 1);

                  addBindings(
                    color,
                    stepDirection === "Aukštyn" ? measure.height : lastHeight,
                    "Koja vienguba " + legWidth,
                    1
                  );
                  wasStep = false;
                  lastHeight = measure.height;
                } else {
                  const maxHeight = Math.max(lastHeight, measure.height);

                  isBindings && addBindings(color, maxHeight, "Centrinis", 2);

                  addBindings(color, maxHeight, "Koja vienguba " + legWidth, 2);

                  lastHeight = measure.height;
                }
              }
            }
          });
        });

        const newFences: GamybaFence[] = project.fenceMeasures
          .filter(
            (item) =>
              item.type !== "Segmentas" && !fenceBoards.includes(item.type)
          )
          .map((item) => {
            return {
              ...item,
              measures: item.measures.map((measure) => ({
                ...measure,
                cut: undefined,
                done: undefined,
                postone: measure.gates.exist ? true : false,
              })),
            };
          });

        const newGamyba = new productionSchema({
          _id: project._id!.toString(),
          creator: { ...project.creator },
          client: { ...project.client },
          orderNumber: project.orderNumber,
          fences: [...newFences],
          aditional: [],
          bindings,
          status: "Negaminti",
        });

        const responseData = await newGamyba.save();

        if (!responseData) return response(res, false, null, "Įvyko klaida");

        const status = "Gaminama";

        project.status = status;

        await project.save();

        emit.toAdmin("newProduction", responseData);
        emit.toProduction("newProduction", responseData);
        emit.toWarehouse("newProduction", responseData);

        emit.toAdmin("changeProjectStatus", { status });

        return response(res, true, responseData, "Perduota gamybai");
      }
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
