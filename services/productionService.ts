import {
  Production,
  Project,
  Bindings,
  FenceSetup,
  SeeThroughSteps,
  ProjectComment,
} from "../data/interfaces";
import productionSchema from "../schemas/productionSchema";
import { findProjectById, updateProjectStatus } from "./projectService";
import fenceSchema from "../schemas/fenceSchema";
import { HydratedDocument, Types } from "mongoose";
import emit from "../sockets/emits";
import { v4 } from "uuid";
import productionArchiveSchema from "../schemas/productionArchiveSchema";

export async function newProductionService(projectId: Types.ObjectId) {
  const project = await validateProductionStart(projectId);
  const fences = await fenceSchema.find();
  const bindings = await calculateBindings(project, fences);
  const newFences = transformFencesForProduction(project, fences);
  const production = await createProductionRecord(project, bindings, newFences);
  await updateProjectStatus(project, "Gaminama");
  emitProductionEvents(production, project);
  return production;
}

// --------------------------------------------------
// 1. Patikrinimas ar projektas egzistuoja ir nėra gamyboje
// --------------------------------------------------
export async function validateProductionStart(projectId: Types.ObjectId) {
  const project = await findProjectById(projectId);
  if (!project) throw new Error("Projektas nerastas");

  const production = await productionSchema.findById(projectId);
  if (production) throw new Error("Objektas jau gaminamas");

  return project;
}

// --------------------------------------------------
// 2. Bindings skaičiavimas
// --------------------------------------------------
export async function calculateBindings(project: HydratedDocument<Project>, fences: FenceSetup[]) {
  const bindings: Bindings[] = [];

  //adds bindings as new or update quantity of existing
  const addBindings = (color: string, height: number, name: string, quantity: number) => {
    let found = false;
    for (const binding of bindings) {
      if (binding.color === color && binding.height === height && binding.name === name) {
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
        name,
        quantity,
        cut: undefined,
        done: undefined,
        postone: false,
        files: [],
      });
    }
    found = false;
  };

  //loops via fences

  project.fenceMeasures.forEach(async (item) => {
    const currentFence = fences.find((fence) => fence.name === item.name);

    if (!currentFence || currentFence.category === "Segmentas") return;
    const color = item.color;
    const isBindings = item.bindings === "Taip" ? true : false;
    const legWidth = item.name.includes("40/105")
      ? "40 mm"
      : item.name.includes("Plank")
        ? "40 mm"
        : "55 mm";
    let lastHeight = 0;
    let stepHeight = 0;
    let stepDirection = "";
    let cornerRadius = 0;
    let wasGates = false;
    let wasCorner = false;
    let wasStep = false;

    let totalFenceboards: any = [];

    item.measures.forEach((measure, index) => {
      const notSpecial = !measure.laiptas.exist && !measure.kampas.exist && !measure.gates.exist;
      const ifFence = !measure.laiptas.exist && !measure.kampas.exist;

      // Calculating Dile
      if (currentFence.name.includes("Dilė")) {
        if (item.direction === "Horizontali")
          addBindings(color, measure.height, "Koja dviguba 20", 2);

        const currentLength = item.direction === "Vertikali" ? measure.height : measure.length;

        if (totalFenceboards.length < 1) {
          totalFenceboards.push({
            length: currentLength,
            quantity: measure.elements,
          });
        } else {
          let fenceboardFound = false;
          totalFenceboards = totalFenceboards.map((fenceboard: any) => {
            if (fenceboard.length === currentLength) {
              fenceboard.quantity += measure.elements;
              fenceboardFound = true;
              return fenceboard;
            } else return fenceboard;
          });

          if (!fenceboardFound)
            totalFenceboards.push({
              length: currentLength,
              quantity: measure.elements,
            });
        }

        return;
      }
      ////////////////////////////
      if (!isBindings) {
        if (ifFence) addBindings(color, measure.height, "Koja dviguba " + legWidth, 2);
      } else {
        if (notSpecial) addBindings(color, measure.height, "Koja vienguba " + legWidth, 2);
        if (measure.gates.exist) addBindings(color, measure.height, "Koja dviguba " + legWidth, 2);
        if (index === 0) {
          if (ifFence) lastHeight = measure.height;
          if (measure.gates.exist) wasGates = true;
          else {
            if (measure.laiptas.exist) wasStep = true;
            if (measure.kampas.exist) wasCorner = true;
          }
          return;
        }

        if (measure.gates.exist) {
          if (index !== 0 && !wasGates) {
            const maxHeight = Math.max(lastHeight, measure.height);
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
            isBindings && addBindings(color, maxHeight, "Elka", 2);
            wasGates = false;
            lastHeight = measure.height;
          } else if (wasCorner && wasStep) {
            const maxHeight =
              stepDirection === "Aukštyn"
                ? lastHeight + stepHeight - (lastHeight - measure.height)
                : measure.height + stepHeight - (measure.height - lastHeight);

            isBindings && addBindings(color, maxHeight, "Kampas " + cornerRadius, 1);
            wasCorner = false;
            wasStep = false;
            lastHeight = measure.height;
          } else if (wasCorner) {
            const maxHeight = Math.max(lastHeight, measure.height);
            isBindings && addBindings(color, maxHeight, "Kampas " + cornerRadius, 1);
            wasCorner = false;
            lastHeight = measure.height;
          } else if (wasStep) {
            const maxHeight =
              stepDirection === "Aukštyn"
                ? lastHeight + stepHeight - (lastHeight - measure.height)
                : measure.height + stepHeight - (measure.height - lastHeight);
            isBindings && addBindings(color, maxHeight, "Centrinis", 2);
            wasStep = false;
            lastHeight = measure.height;
          } else {
            const maxHeight = Math.max(lastHeight, measure.height);
            isBindings && addBindings(color, maxHeight, "Centrinis", 2);
            lastHeight = measure.height;
          }
        }
      }
    });

    if (totalFenceboards.length > 0) {
      totalFenceboards.forEach((item: any) => {
        addBindings(color, item.length, "Dilė", item.quantity);
      });
    }
  });
  return bindings;
}

export function transformFencesForProduction(
  project: HydratedDocument<Project>,
  fences: FenceSetup[],
) {
  return project.fenceMeasures.reduce((acc: any[], item: any) => {
    const currentFence = fences.find((f: any) => f.name === item.name);
    if (!currentFence || currentFence.category !== "Tvora") return acc;

    const fenceRename = item.seeThrough
      .replace("š", "s")
      .replace("25% Pramatomumas", "pramatoma25")
      .replace("50% Pramatomumas", "pramatoma50")
      .toLowerCase();

    const step = currentFence.steps[fenceRename as keyof SeeThroughSteps] || 0;

    const isVertical = currentFence.defaultDirection === "Vertikali";

    acc.push({
      ...item,
      step,
      measures: item.measures.map((m: any) => {
        const updated: any = {
          ...m.toObject(),
          cut: undefined,
          done: undefined,
          postone: m.gates.exist ? true : false,
        };

        if (isVertical) {
          const oldLength = updated.length;
          updated.length = updated.height;
          updated.height = oldLength;
        }

        return updated;
      }),
    });

    return acc;
  }, []);
}

// --------------------------------------------------
// 4. Naujo gamybos įrašo sukūrimas
// --------------------------------------------------
export async function createProductionRecord(
  project: HydratedDocument<Project>,
  bindings: Bindings[],
  newFences: Production[],
  comments?: ProjectComment[],
  files?: string[],
) {
  const newProduction = new productionSchema({
    _id: project._id!.toString(),
    creator: { ...project.creator },
    client: { ...project.client },
    orderNumber: project.orderNumber,
    fences: newFences,
    comments: comments || [],
    bindings,
    status: "Negaminti",
    files: files || [],
  });

  const saved = await newProduction.save();
  if (!saved) throw new Error("Nepavyko sukurti gamybos įrašo");

  return saved;
}

// --------------------------------------------------
// 6. Emit eventai
// --------------------------------------------------
export function emitProductionEvents(production: Production, project: HydratedDocument<Project>) {
  emit.toAdmin("newProduction", production);
  emit.toProduction("newProduction", production);
  emit.toWarehouse("newProduction", production);
  emit.toAdmin("changeProjectStatus", { status: project.status });
}

export async function deleteProduction(_id: string) {
  const production = await productionSchema.findById(_id);
  if (!production) throw new Error("Projektas nerastas");

  const doesExist = await productionArchiveSchema.findById(_id);
  if (!doesExist) {
    const archived = await productionArchiveSchema.create({
      ...production.toObject(),
    });

    if (!archived) throw new Error("Klaida perkeliant į archyvą");
  }

  const data = await productionSchema.findByIdAndDelete(_id);
  if (!data) throw new Error("Projektas nerastas");

  emit.toAdmin("deleteProduction", { _id });
  emit.toProduction("deleteProduction", { _id });
  emit.toWarehouse("deleteProduction", { _id });
  emit.toInstallation("deleteProduction", { _id });

  return true;
}

export async function findProductionById(_id: string) {
  const production = await productionSchema.findById(_id);
  if (!production) throw new Error("Gamybos įrašas nerastas");
  return production;
}
