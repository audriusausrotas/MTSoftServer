import { Production } from "../data/interfaces";
import productionArchiveSchema from "../schemas/productionArchiveSchema";
import emit from "../sockets/emits";
import cron from "node-cron";

export const deleteProduction = () => {
  cron.schedule("4 2 * * *", async () => {
    console.log("deleting production projects...");

    try {
      const deletedProjects = await productionArchiveSchema.find();
      if (!deletedProjects.length) {
        console.log("No projects found for cleanup.");
        return;
      }

      const deletedProduction: Production[] = [];

      for (const production of deletedProjects) {
        try {
          const dateArchived = new Date(production.dateArchieved);
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

          if (dateArchived < twoMonthsAgo) {
            const responseData: any = await productionArchiveSchema.findByIdAndDelete(
              production._id,
            );

            emit.toAdmin("archiveProductionDeleted", responseData);
            deletedProduction.push(responseData);
          }
        } catch (error) {
          console.error(`Error deleting project ${production._id}:`, error);
        }
      }

      console.log(`Deleted ${deletedProduction.length} production projects.`);
    } catch (error) {
      console.error("Error while cleaning up production projects:", error);
    }
  });
};
