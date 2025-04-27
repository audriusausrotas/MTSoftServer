import { exec } from "child_process";
import cron from "node-cron";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export const databaseBackupToAtlas = () => {
  cron.schedule("8 1 * * *", () => {
    console.log("Restoring MongoDB backup to Atlas...");

    const collections = [
      "archive",
      "backup",
      "bonus",
      "clients",
      "defaultValues",
      "gamyba",
      "gates",
      "montavimas",
      "potentialClients",
      "potentialClientsUnsuscribed",
      "products",
      "projects",
      "projectsDeleted",
      "projectsUnconfirmed",
      "projectsVersions",
      "schedule",
      "selectData",
      "userRights",
      "users",
    ];

    const atlasURI = process.env.MONGODB_URI_REMOTE2;

    collections.forEach((collection) => {
      const backupFile = `C:/MTwebsite/mongodbBackups/json/${collection}_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;

      if (!fs.existsSync(backupFile)) {
        console.error(`Backup file for collection ${collection} missing! Skipping Atlas restore.`);
        return;
      }

      const restoreCommand = `"C:/MTwebsite/mongodb/bin/mongoimport.exe" --uri="${atlasURI}" --db=ModerniTvora --collection=${collection} --file="${backupFile}" --jsonArray --drop`;

      exec(restoreCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Restore failed for collection ${collection}:`, stderr);
        } else {
          console.log(`Collection ${collection} successfully synced to Atlas!`);
        }
      });
    });
  });
};
