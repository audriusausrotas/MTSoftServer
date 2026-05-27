import { HydratedDocument } from "mongoose";
import { Project } from "../data/interfaces";
import backupSchema from "../schemas/backupSchema";
import { findProjectById } from "./projectService";

export async function createBackup(_id: any, project?: HydratedDocument<Project> | null) {
  const backupProject = await backupSchema.findById(_id);

  if (!backupProject) {
    const tempProject = project ?? (await findProjectById(_id));
    const projectData = tempProject.toObject();
    await new backupSchema(projectData).save();
  }
}

export async function deleteBackup(_id: any) {
  await backupSchema.findByIdAndDelete(_id);
}
