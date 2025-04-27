import cron from "node-cron";
import { exec } from "child_process";

export const backupDatabase = () => {
  cron.schedule("10 4 * * *", () => {
    console.log("Running daily MongoDB backup...");

    const mongoDumpPath = "C:/MTwebsite/mongodb/bin/mongodump.exe";
    const gzBackupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
      new Date().toISOString().split("T")[0]
    }.gz`;

    // Run mongodump to create .gz backup
    exec(
      `${mongoDumpPath} --gzip --archive=${gzBackupFile} --db=moderniTvora`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Backup failed:", stderr);
        } else {
          console.log("Backup completed successfully:", gzBackupFile);
        }
      }
    );

    // Run mongoexport to create .json backup for collections
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

    collections.forEach((collection) => {
      const jsonBackupFile = `C:/MTwebsite/mongodbBackups/json/${collection}_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;

      const exportCommand = `"C:/MTwebsite/mongodb/bin/mongoexport.exe" --uri="mongodb://localhost:27017" --db=moderniTvora --collection=${collection} --out="${jsonBackupFile}" --jsonArray`;

      exec(exportCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Backup failed for collection ${collection}:`, stderr);
        } else {
          console.log(
            `Backup completed successfully for collection ${collection}:`,
            jsonBackupFile
          );
        }
      });
    });

    // Clean up backups older than 7 days json
    exec(
      `forfiles /p "C:/MTwebsite/mongodbBackups/json" /m *_backup_*.json /d -7 /c "cmd /c del @file"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("json old backup cleanup failed:", stderr);
        } else {
          console.log("json old backups deleted.");
        }
      }
    );
  });

  // Clean up old backups older than 7 days .gz
  exec(
    `forfiles /p "C:/MTwebsite/mongodbBackups/" /m mongo_backup_*.gz /d -7 /c "cmd /c del @file"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(".gz old backup cleanup failed:", stderr);
      } else {
        console.log(".gz old backups deleted.");
      }
    }
  );
};
