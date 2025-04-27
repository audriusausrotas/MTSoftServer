// import cron from "node-cron";
// import { exec } from "child_process";

// export const backupDatabase = () => {
//   cron.schedule("37 21 * * *", () => {
//     console.log("Running daily MongoDB backup...");

//     const mongoDumpPath = `"C:\\MTwebsite\\mongodb\\bin\\mongodump.exe"`;
//     const backupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
//       new Date().toISOString().split("T")[0]
//     }.gz`;

//     exec(
//       `${mongoDumpPath} --gzip --archive=${backupFile} --db=moderniTvora`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error("Backup failed:", stderr);
//         } else {
//           console.log("Backup completed successfully:", backupFile);
//         }
//       }
//     );

//     exec(
//       `forfiles /p "C:\\MTwebsite\\mongodbBackups" /m mongo_backup_*.gz /d -7 /c "cmd /c del @file"`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error("Old backup cleanup failed:", stderr);
//         } else {
//           console.log("Old backups deleted.");
//         }
//       }
//     );
//   });
// };

import cron from "node-cron";
import { exec } from "child_process";
import fs from "fs";

export const backupDatabase = () => {
  cron.schedule("43 23 * * *", () => {
    console.log("Running daily MongoDB backup as JSON...");

    const collections = ["schedule", "clients"];

    // Loop over the collections to back them up individually
    collections.forEach((collection) => {
      const backupFile = `C:/MTwebsite/mongodbBackups/${collection}_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;

      // Command to export the collection as a JSON file
      const exportCommand = `"C:\\MTwebsite\\mongodb\\bin\\mongoexport.exe" --uri="mongodb://localhost:27017" --db=moderniTvora --collection=${collection} --out="${backupFile}" --jsonArray`;

      exec(exportCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Backup failed for collection ${collection}:`, stderr);
        } else {
          console.log(`Backup completed successfully for collection ${collection}:`, backupFile);
        }
      });
    });

    // Clean up backups older than 7 days
    exec(
      `forfiles /p "C:\\MTwebsite\\mongodbBackups" /m *_backup_*.json /d -7 /c "cmd /c del @file"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Old backup cleanup failed:", stderr);
        } else {
          console.log("Old backups deleted.");
        }
      }
    );
  });
};
