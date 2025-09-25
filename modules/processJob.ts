import installationSchema from "../schemas/installationSchema";
import { InstallationFence, Project } from "../data/interfaces";
import projectSchema from "../schemas/projectSchema";
import { HydratedDocument, Types } from "mongoose";
import { Response } from "express";

export default async (_id: Types.ObjectId, worker: string, res: Response) => {
  const project: HydratedDocument<Project> | null =
    await projectSchema.findById(_id);

  if (!project)
    return { success: false, data: null, message: "Projektas nerastas" };

  const installation = await installationSchema.findById(project._id);

  const newFences: InstallationFence[] = project.fenceMeasures.map((item) => {
    return {
      ...item,
      measures: item.measures.map((measure) => ({
        ...measure,
        done: undefined,
        postone: false,
      })),
    };
  });

  if (installation) {
    if (installation.workers.includes(worker))
      return {
        success: false,
        data: null,
        message: "Objektas jau montuojamas",
      };
    else {
      installation.workers.push(worker);
      const data = await installation.save();
      return { success: true, data, message: "Montavimas priskirtas" };
    }
  } else {
    const newResults = project.results.map((item) => {
      return {
        name: item.name,
        quantity: item.quantity,
        height: item.height,
        width: item.width,
        color: item.color,
        category: item.category,
        delivered: false,
      };
    });

    const newWorks = project.works.map((item) => {
      return {
        name: item.name,
        quantity: item.quantity,
        delivered: false,
      };
    });

    const newInstallation = new installationSchema({
      _id: project._id?.toString(),
      creator: { ...project.creator },
      client: { ...project.client },
      orderNumber: project.orderNumber,
      fences: newFences,
      results: newResults,
      works: newWorks,
      comments: [],
      workers: [worker],
    });

    const data = await newInstallation.save();
    if (!data) return { success: false, data: null, message: "Įvyko klaida" };

    project.status = "Montuojama";

    await project.save();
    return {
      success: true,
      data: newInstallation,
      message: "Perduota montavimui",
    };
  }
};
