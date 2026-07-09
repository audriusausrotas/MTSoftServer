import {
  Production,
  Project,
  Bindings,
  FenceSetup,
  SeeThroughSteps,
  ProjectComment,
  User,
  ProductionEvent,
} from "../data/interfaces";
import productionSchema from "../schemas/productionSchema";
import { findProjectById, updateProjectStatus } from "./projectService";
import fenceSchema from "../schemas/fenceSchema";
import { HydratedDocument, Types } from "mongoose";
import emit from "../sockets/emits";
import { v4 } from "uuid";
import productionArchiveSchema from "../schemas/productionArchiveSchema";
import { deleteFiles } from "./uploadServices";
import productionEventSchema from "../schemas/productionEventSchema";

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
  const addBindings = (
    color: string,
    height: number,
    name: string,
    quantity: number,
    postone: boolean = false,
  ) => {
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
        cut: 0,
        done: 0,
        postone: postone || false,
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
          addBindings(color, measure.height, "Koja dviguba 20 mm", 2);

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
        if (measure.gates.exist)
          addBindings(color, measure.height, "Koja dviguba " + legWidth, 2, true);
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
            isBindings && addBindings(color, maxHeight + 1, "Elka", 2);
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
            isBindings && addBindings(color, maxHeight + 1, "Elka", 2);
            wasGates = false;
            lastHeight = measure.height;
          } else if (wasCorner && wasStep) {
            const maxHeight =
              stepDirection === "Aukštyn"
                ? lastHeight + stepHeight - (lastHeight - measure.height)
                : measure.height + stepHeight - (measure.height - lastHeight);

            isBindings &&
              addBindings(
                color,
                maxHeight + (legWidth === "40 mm" ? 1 : 14),
                "Kampas vidus " +
                  cornerRadius +
                  " " +
                  (legWidth === "40 mm" ? "40" : "60") +
                  "x" +
                  (legWidth === "40 mm" ? "40" : "60"),
                1,
              );
            isBindings &&
              addBindings(
                color,
                maxHeight + (legWidth === "40 mm" ? 1 : 14),
                "Kampas išorė " +
                  cornerRadius +
                  " " +
                  (legWidth === "40 mm" ? "40" : "60") +
                  "x" +
                  (legWidth === "40 mm" ? "40" : "60"),
                1,
              );
            wasCorner = false;
            wasStep = false;
            lastHeight = measure.height;
          } else if (wasCorner) {
            const maxHeight = Math.max(lastHeight, measure.height);
            if (isBindings) {
              addBindings(
                color,
                maxHeight + (legWidth === "40 mm" ? 1 : 14),
                "Kampas vidus " + cornerRadius,
                1,
              );
              addBindings(
                color,
                maxHeight + (legWidth === "40 mm" ? 1 : 14),
                "Kampas išorė " + cornerRadius,
                1,
              );
              addBindings(color, 0, "Kepurė kampinė " + (legWidth === "40 mm" ? "40" : "60"), 1);
            }
            wasCorner = false;
            lastHeight = measure.height;
          } else if (wasStep) {
            const maxHeight =
              stepDirection === "Aukštyn"
                ? lastHeight + stepHeight - (lastHeight - measure.height)
                : measure.height + stepHeight - (measure.height - lastHeight);
            if (isBindings) {
              addBindings(color, maxHeight + (legWidth === "40 mm" ? 1 : 14), "Centrinis", 2);
              addBindings(color, 0, "Kepurė " + (legWidth === "40 mm" ? "40" : "60"), 1);
            }
            wasStep = false;
            lastHeight = measure.height;
          } else {
            const maxHeight = Math.max(lastHeight, measure.height);
            if (isBindings) {
              addBindings(color, maxHeight + (legWidth === "40 mm" ? 1 : 14), "Centrinis", 2);
              addBindings(color, 0, "Kepurė " + (legWidth === "40 mm" ? "40" : "60"), 1);
            }
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

  const bindingsWithFiles = bindings.map((binding: Bindings) => {
    const foundFile = findFilesByName(binding.name);
    if (foundFile) {
      return {
        ...binding,
        files: [foundFile],
      };
    }
    return binding;
  });

  return bindingsWithFiles;
}

export function transformFencesForProduction(
  project: HydratedDocument<Project>,
  fences: FenceSetup[],
) {
  return project.fenceMeasures.reduce((acc: any[], item: any) => {
    const currentFence = fences.find((f: any) => f.name === item.name);
    if (!currentFence || currentFence.category !== "Tvora") return acc;

    const file = findFilesByName(currentFence.name);

    const fenceRename = item.seeThrough
      .replace("š", "s")
      .replace("25% Pramatomumas", "pramatoma25")
      .replace("50% Pramatomumas", "pramatoma50")
      .toLowerCase();

    const step = currentFence.steps[fenceRename as keyof SeeThroughSteps] || 0;

    const isVertical = currentFence.defaultDirection === "Vertikali";

    acc.push({
      ...item,
      files: file ? [file] : [],
      step,
      measures: item.measures.map((m: any) => {
        const updated: any = {
          ...m.toObject(),
          cut: undefined,
          done: undefined,
          holes: undefined,
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

// --------------------------------------------------
// 7. failų suradimas pagal pavadinimą
// --------------------------------------------------

function findFilesByName(name: string) {
  let foundFile: string = "";

  switch (name.toLowerCase()) {
    case "koja vienguba 20 mm":
      foundFile = "/images/blueprints/koja_vienguba_20.jpg";
      break;
    case "koja vienguba 40 mm":
      foundFile = "/images/blueprints/koja_vienguba_40.jpg";
      break;
    case "koja vienguba 55 mm":
      foundFile = "/images/blueprints/koja_vienguba_55.jpg";
      break;
    case "koja dviguba 20 mm":
      foundFile = "/images/blueprints/koja_dviguba_20.jpg";
      break;
    case "koja dviguba 40 mm":
      foundFile = "/images/blueprints/koja_dviguba_40.jpg";
      break;
    case "koja dviguba 55 mm":
      foundFile = "/images/blueprints/koja_dviguba_55.jpg";
      break;
    case "elka":
      foundFile = "/images/blueprints/elka.jpg";
      break;
    case "centrinis":
      foundFile = "/images/blueprints/centrinis.jpg";
      break;
    case "galinis 40":
      foundFile = "/images/blueprints/galinis_40.jpg";
      break;
    case "galinis 60":
      foundFile = "/images/blueprints/galinis_60.jpg";
      break;
    case "kampas vidus 90":
      foundFile = "/images/blueprints/kampas_vidus_90.jpg";
      break;
    case "kampas išorė 90":
      foundFile = "/images/blueprints/kampas_isore_90.jpg";
      break;
    case "kampas vidus 90 6x6":
      foundFile = "/images/blueprints/kampas_vidus_90_6x6.jpg";
      break;
    case "kampas išorė 90 6x6":
      foundFile = "/images/blueprints/kampas_isore_90_6x6.jpg";
      break;
    case "kepurė 60":
      foundFile = "/images/blueprints/kepure_60.jpg";
      break;
    case "kepurė 40":
      foundFile = "/images/blueprints/kepure_40.jpg";
      break;
    case "kepurė kampinė 40":
      foundFile = "/images/blueprints/kepure_kampine_40.jpg";
      break;
    case "kepurė kampinė 60":
      foundFile = "/images/blueprints/kepure_kampine_60.jpg";
      break;
    case "daimond 60/90":
      foundFile = "/images/blueprints/daimond_60_90.jpg";
      break;
    case "daimond 40/105":
      foundFile = "/images/blueprints/daimond_40_105.jpg";
      break;
    case "daimond 60/140":
      foundFile = "/images/blueprints/daimond_60_140.jpg";
      break;
    case "daimond vertical":
      foundFile = "/images/blueprints/daimond_vertical.jpg";
      break;
    case "dilė":
      foundFile = "/images/blueprints/dilė.jpg";
      break;
    case "eglė":
      foundFile = "/images/blueprints/eglė.jpg";
      break;
    case "eglė plus":
      foundFile = "/images/blueprints/eglėplus.jpg";
      break;
    case "plank":
      foundFile = "/images/blueprints/plank.jpg";
      break;
    case "žaliuzi":
      foundFile = "/images/blueprints/žaliuzi.jpg";
      break;

    default:
      break;
  }

  return foundFile;
}

// --------------------------------------------------
// 8. Gamybos failų trynimas
// --------------------------------------------------
export async function deleteProduction(_id: string) {
  const production = await productionSchema.findById(_id);

  if (!production) throw new Error("Projektas nerastas");

  const files: string[] = [
    ...(production.files || []),
    ...(production.fences?.flatMap((fence: any) => fence.files || []) || []),
    ...(production.bindings?.flatMap((binding: any) => binding.files || []) || []),
  ];

  await deleteFiles(files);

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

export async function updateMeasure(data: any, user: User) {
  const { _id, index, measureIndex, value, field, holesCount } = data;

  const project = await findProductionById(_id);

  const isBinding = measureIndex === undefined || measureIndex === null;
  let oldValue = 0;

  if (isBinding) {
    oldValue = (project as any).bindings?.[index]?.[field] ?? 0;
    (project as any).bindings[index][field] = value;
  } else {
    oldValue = (project as any).fences?.[index]?.measures?.[measureIndex]?.[field] ?? 0;
    (project as any).fences[index].measures[measureIndex][field] = value;
  }

  const quantity = value - oldValue;

  const savedProject = await project.save();

  if (!savedProject) throw new Error("Projektas neišsaugotas");

  if ((field === "cut" || field === "done" || field === "holes") && quantity > 0) {
    const event = buildProductionEvent(data, quantity, savedProject, user, holesCount);
    await new productionEventSchema(event).save();
  }

  emit.toAdmin("updateProductionMeasure", data);
  emit.toProduction("updateProductionMeasure", data);
  emit.toWarehouse("updateProductionMeasure", data);
  emit.toInstallation("updateProductionMeasure", data);

  return data;
}

export async function updateHoles(data: any, user: User) {
  const { _id, index, value, holesCount } = data;

  const project = await findProductionById(_id);

  const oldValue = project.fences[index].holesDone;
  const quantity = value - oldValue;

  project.fences[index].holesDone = value;

  const savedProject = await project.save();

  if (quantity > 0) {
    const event = buildProductionEvent(data, quantity, savedProject, user, holesCount);
    await new productionEventSchema(event).save();
  }

  emit.toAdmin("updateProductionHoles", data);
  emit.toProduction("updateProductionHoles", data);
  emit.toWarehouse("updateProductionHoles", data);
  emit.toInstallation("updateProductionHoles", data);

  return data;
}

export async function productionDefect(data: any, user: User) {
  const { _id, index, measureIndex } = data;

  const project = await findProductionById(_id);

  const isBinding = measureIndex === undefined || measureIndex === null;
  if (isBinding) {
    (project as any).bindings[index]["cut"] -= 1;
    (project as any).bindings[index]["done"] -= 1;
  } else {
    (project as any).fences[index].measures[measureIndex]["cut"] -= 1;
    (project as any).fences[index].measures[measureIndex]["done"] -= 1;
  }

  const savedProject = await project.save();

  const event = buildProductionEvent(data, 1, savedProject, user, 0);
  await new productionEventSchema(event).save();

  emit.toAdmin("productionDefect", data);
  emit.toProduction("productionDefect", data);
  emit.toWarehouse("productionDefect", data);
  emit.toInstallation("productionDefect", data);

  return data;
}

function buildProductionEvent(
  data: any,
  quantity: number,
  project: Production,
  user: User,
  holesCount: number,
) {
  const isBinding = data.measureIndex === undefined || data.measureIndex === null;

  const location = {
    index: data.index,
    measureIndex: isBinding ? null : data.measureIndex,
  };

  return {
    orderNumber: project.orderNumber,
    timestamp: new Date().toISOString(),

    user: {
      username: user.username,
      lastName: user.lastName,
      email: user.email,
    },

    machine: data.selectedMachine,
    holeInformation: data.selectedHolesInfo,

    operation: data.field,

    element: {
      name: isBinding ? project.bindings?.[data.index]?.name : project.fences?.[data.index]?.name,

      quantity,
      holesCount,
      length:
        data.field === "holes" || data.field === "defect"
          ? 0
          : isBinding
            ? project.bindings?.[data.index]?.height
            : project.fences?.[data.index]?.measures?.[data.measureIndex]?.length,

      location,
    },
  };
}
