import deleteVersions from "../modules/deleteProjectVersions";
import unconfirmedSchema from "../schemas/unconfirmedSchema";
import projectSchema from "../schemas/projectSchema";
import backupSchema from "../schemas/backupSchema";
import emit from "../sockets/emits";
import cron from "node-cron";
import fs from "fs";

export const clearUnconfirmed = () => {
  cron.schedule("0 2 * * *", async () => {
    console.log("Cleaning up unconfirmed projects...");

    try {
      const projects = await projectSchema.find();
      if (!projects.length) {
        console.log("No projects found for cleanup.");
        return;
      }

      const currentDate = new Date();
      const deletedUnconfirmed: any[] = [];

      const deletionPromises = projects.map(async (project: any) => {
        try {
          if (["Nepatvirtintas", "Netinkamas"].includes(project.status)) {
            const expirationDate = new Date(project.dateExparation);

            if (currentDate > expirationDate) {
              const existingProject = await projectSchema.findById(project._id);
              if (!existingProject) return;

              await deleteVersions(project.versions);

              const projectData = project.toObject();
              const unconfirmedProject = new unconfirmedSchema({ ...projectData });
              const data = await unconfirmedProject.save();

              await projectSchema.findByIdAndDelete(project._id);
              await backupSchema.findByIdAndDelete(project._id);

              emit.toAdmin("addUnconfirmed", project);
              deletedUnconfirmed.push(data);
            }
          }
        } catch (error) {
          console.error(`Error deleting project ${project._id}:`, error);
        }
      });

      await Promise.all(deletionPromises);

      console.log(`Deleted ${deletedUnconfirmed.length} unconfirmed projects.`);
    } catch (error) {
      console.error("Error while cleaning up unconfirmed projects:", error);
    }
  });
};
