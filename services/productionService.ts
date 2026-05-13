import { Prodution, Project, Bindings, FenceSetup, SeeThroughSteps } from "../data/interfaces";
import productionSchema from "../schemas/productionSchema";
import { findProjectById, updateProjectStatus } from "./projectService";
import fenceSchema from "../schemas/fenceSchema";
import { HydratedDocument } from "mongoose";
import emit from "../sockets/emits";
import { v4 } from "uuid";

export async function newProductionService(projectId: string) {
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
export async function validateProductionStart(projectId: string) {
  const project = await findProjectById(projectId);

  const production = await productionSchema.find();
  const exists = production.some((p) => p._id.toString() === project._id!.toString());

  if (exists) throw new Error("Objektas jau gaminamas");

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

      // Calculating Dile
      if (currentFence.name.includes("Dilė")) {
        if (item.direction === "Horizontali")
          addBindings(color, measure.height, "Koja Dviguba 20", 2);

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
        if (notSpecial) addBindings(color, measure.height, "Koja Dviguba " + legWidth, 2);
      } else {
        // if first element is fence, adds one leg
        if (index === 0) {
          if (notSpecial) {
            lastHeight = measure.height;
            addBindings(color, measure.height, "Koja vienguba " + legWidth, 1);
          } else {
            if (measure.laiptas.exist) wasStep = true;
            if (measure.kampas.exist) wasCorner = true;
            if (measure.gates.exist) wasGates = true;
          }
          return;
        }

        if (index === item.measures.length - 1) {
          if (notSpecial) addBindings(color, measure.height, "Koja vienguba " + legWidth, 1);
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
                : measure.height + stepHeight - (measure.height - lastHeight);

            isBindings && addBindings(color, maxHeight, "Kampas " + cornerRadius, 1);

            addBindings(color, maxHeight, "Koja vienguba " + legWidth, 1);
            addBindings(
              color,
              stepDirection === "Aukštyn" ? measure.height : lastHeight,
              "Koja vienguba " + legWidth,
              1,
            );

            wasCorner = false;
            wasStep = false;
            lastHeight = measure.height;
          } else if (wasCorner) {
            const maxHeight = Math.max(lastHeight, measure.height);
            isBindings && addBindings(color, maxHeight, "Kampas " + cornerRadius, 1);

            addBindings(
              color,
              maxHeight,
              "Koja vienguba " + legWidth,

              2,
            );

            wasCorner = false;
            lastHeight = measure.height;
          } else if (wasStep) {
            const maxHeight =
              stepDirection === "Aukštyn"
                ? lastHeight + stepHeight - (lastHeight - measure.height)
                : measure.height + stepHeight - (measure.height - lastHeight);

            isBindings && addBindings(color, maxHeight, "Centrinis", 2);

            addBindings(color, maxHeight, "Koja vienguba " + legWidth, 1);

            addBindings(
              color,
              stepDirection === "Aukštyn" ? measure.height : lastHeight,
              "Koja vienguba " + legWidth,
              1,
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

    if (totalFenceboards.length > 0) {
      totalFenceboards.forEach((item: any) => {
        addBindings(color, item.length, "Dilė", item.quantity);
      });
    }
  });
  return bindings;
}

// --------------------------------------------------
// 3. Fences transformavimas į gamybos formatą
// --------------------------------------------------
export function transformFencesForProduction(
  project: HydratedDocument<Project>,
  fences: FenceSetup[],
) {
  return project.fenceMeasures
    .filter((item: any) => {
      const currentFence = fences.find((f: any) => f.name === item.name);
      return currentFence && currentFence.category === "Tvora";
    })
    .map((item: any) => {
      const currentFence = fences.find((f: any) => f.name === item.name);

      const fenceRename = item.seeThrough
        .replace("š", "s")
        .replace("25% Pramatomumas", "pramatoma25")
        .replace("50% Pramatomumas", "pramatoma50")
        .toLowerCase();

      const step = currentFence?.steps[fenceRename as keyof SeeThroughSteps] || 0;

      return {
        ...item,
        step,
        measures: item.measures.map((m: any) => ({
          ...m,
          cut: undefined,
          done: undefined,
          postone: m.gates.exist ? true : false,
        })),
      };
    });
}

// --------------------------------------------------
// 4. Naujo gamybos įrašo sukūrimas
// --------------------------------------------------
export async function createProductionRecord(
  project: HydratedDocument<Project>,
  bindings: Bindings[],
  newFences: Prodution[],
) {
  const newProduction = new productionSchema({
    _id: project._id!.toString(),
    creator: { ...project.creator },
    client: { ...project.client },
    orderNumber: project.orderNumber,
    fences: newFences,
    aditional: [],
    bindings,
    status: "Negaminti",
  });

  const saved = await newProduction.save();
  if (!saved) throw new Error("Nepavyko sukurti gamybos įrašo");

  return saved;
}

// --------------------------------------------------
// 6. Emit eventai
// --------------------------------------------------
export function emitProductionEvents(production: Prodution, project: HydratedDocument<Project>) {
  emit.toAdmin("newProduction", production);
  emit.toProduction("newProduction", production);
  emit.toWarehouse("newProduction", production);
  emit.toAdmin("changeProjectStatus", { status: project.status });
}
