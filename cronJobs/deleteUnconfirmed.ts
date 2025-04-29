import { Project } from "../data/interfaces";
import unconfirmedSchema from "../schemas/unconfirmedSchema";
import emit from "../sockets/emits";
import cron from "node-cron";

export const deleteUnconfirmed = () => {
  cron.schedule("6 4 * * *", async () => {
    console.log("Cleaning up unconfirmed projects...");

    try {
      const unconfirmedProjects = await unconfirmedSchema.find();
      if (!unconfirmedProjects.length) {
        console.log("No projects found for cleanup.");
        return;
      }

      const unconfirmedDeleted: Project[] = [];

      for (const project of unconfirmedProjects) {
        try {
          const dateArchived = new Date(project.dates.dateArchieved);
          const nineMonthAgo = new Date();
          nineMonthAgo.setMonth(nineMonthAgo.getMonth() - 9);

          if (dateArchived < nineMonthAgo) {
            const responseData: any = await unconfirmedSchema.findByIdAndDelete(project._id);

            emit.toAdmin("deleteDeleted", responseData);
            unconfirmedDeleted.push(responseData);
          }
        } catch (error) {
          console.error(`Error deleting project ${project._id}:`, error);
        }
      }

      console.log(`Deleted ${unconfirmedDeleted.length} unconfirmed projects.`);
    } catch (error) {
      console.error("Error while cleaning up unconfirmed projects:", error);
    }
  });
};
