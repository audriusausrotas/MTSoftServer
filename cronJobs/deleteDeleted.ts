import { Project } from "../data/interfaces";
import deletedSchema from "../schemas/deletedSchema";
import emit from "../sockets/emits";
import cron from "node-cron";

export const deleteDeleted = () => {
  cron.schedule("4 4 * * *", async () => {
    console.log("deleting deleted projects...");

    try {
      const deletedProjects = await deletedSchema.find();
      if (!deletedProjects.length) {
        console.log("No projects found for cleanup.");
        return;
      }

      const deletedDeleted: Project[] = [];

      for (const project of deletedProjects) {
        try {
          const dateArchived = new Date(project.dates.dateArchieved);
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

          if (dateArchived < twoMonthsAgo) {
            const responseData: any = await deletedSchema.findByIdAndDelete(
              project._id
            );

            emit.toAdmin("deleteDeleted", responseData);
            deletedDeleted.push(responseData);
          }
        } catch (error) {
          console.error(`Error deleting project ${project._id}:`, error);
        }
      }

      console.log(`Deleted ${deletedDeleted.length} deleted projects.`);
    } catch (error) {
      console.error("Error while cleaning up deleted projects:", error);
    }
  });
};
