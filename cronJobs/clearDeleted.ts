import deleteVersions from "../modules/deleteProjectVersions";
import unconfirmedSchema from "../schemas/unconfirmedSchema";
import deletedSchema from "../schemas/deletedSchema";
import backupSchema from "../schemas/backupSchema";
import emit from "../sockets/emits";
import cron from "node-cron";

export const clearDeleted = () => {
  cron.schedule("4 4 * * *", async () => {
    console.log("Cleaning up unconfirmed projects...");

    try {
      const deletedProjects = await deletedSchema.find();
      if (!deletedProjects.length) {
        console.log("No projects found for cleanup.");
        return;
      }

      const currentDate = new Date();
      const deletedDeleted: any[] = [];

      const deletionPromises = deletedProjects.map(async (project: any) => {
        try {
          const expirationDate = new Date(project.dateExparation);

          if (currentDate > expirationDate) {
            const existingProject = await deletedSchema.findById(project._id);
            if (!existingProject) return;

            const responseData = await deletedSchema.findByIdAndDelete(
              project._id
            );

            emit.toAdmin("deleteDeleted", responseData);
            deletedDeleted.push(responseData);
          }
        } catch (error) {
          console.error(`Error deleting project ${project._id}:`, error);
        }
      });

      await Promise.all(deletionPromises);

      console.log(`Deleted ${deletedDeleted.length} deleted projects.`);
    } catch (error) {
      console.error("Error while cleaning up unconfirmed projects:", error);
    }
  });
};
