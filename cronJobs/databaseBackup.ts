// import cron from "node-cron";
// import { exec } from "child_process";

// export const backupDatabase = () => {
//   cron.schedule("10 4 * * *", () => {
//     console.log("Running daily MongoDB backup...");

//     const mongoDumpPath = "C:/MTwebsite/mongodb/bin/mongodump.exe";
//     const gzBackupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
//       new Date().toISOString().split("T")[0]
//     }.gz`;

//     // Run mongodump to create .gz backup
//     exec(
//       `${mongoDumpPath} --gzip --archive=${gzBackupFile} --db=moderniTvora`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error("Backup failed:", stderr);
//         } else {
//           console.log("Backup completed successfully:", gzBackupFile);
//         }
//       },
//     );

//     // Run mongoexport to create .json backup for collections
//     const collections = [
//       "backup",
//       "bonus",
//       "clients",
//       "defaultValues",
//       // "gates",
//       "gatePrices",
//       "installation",
//       "orders",
//       "fences",
//       "potentialClients",
//       "potentialClientsUnsuscribed",
//       "production",
//       "products",
//       "projects",
//       "projectsArchived",
//       "websiteSettings",
//       "projectsDeleted",
//       "projectsFinished",
//       "projectsUnconfirmed",
//       "projectsVersions",
//       "schedule",
//       "selectData",
//       "suppliers",
//       "userRights",
//       "users",
//     ];

//     collections.forEach((collection) => {
//       const jsonBackupFile = `C:/MTwebsite/mongodbBackups/json/${collection}_backup_${
//         new Date().toISOString().split("T")[0]
//       }.json`;

//       const exportCommand = `"C:/MTwebsite/mongodb/bin/mongoexport.exe" --uri="mongodb://localhost:27017" --db=moderniTvora --collection=${collection} --out="${jsonBackupFile}" --jsonArray`;

//       exec(exportCommand, (error, stdout, stderr) => {
//         if (error) {
//           console.error(`Backup failed for collection ${collection}:`, stderr);
//         } else {
//           console.log(
//             `Backup completed successfully for collection ${collection}:`,
//             jsonBackupFile,
//           );
//         }
//       });
//     });

//     // Clean up backups older than 7 days json
//     exec(
//       `forfiles /p "C:\\MTwebsite\\mongodbBackups\\json" /m *_backup_*.json /d -7 /c "cmd /c del @file"`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error("json old backup cleanup failed:", stderr);
//         } else {
//           console.log("json old backups deleted.");
//         }
//       },
//     );

//     // Clean up old backups older than 7 days .gz
//     exec(
//       `forfiles /p "C:\\MTwebsite\\mongodbBackups" /m mongo_backup_*.gz /d -7 /c "cmd /c del @file"`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error(".gz old backup cleanup failed:", stderr);
//         } else {
//           console.log(".gz old backups deleted.");
//         }
//       },
//     );
//   });
// };

import cron from "node-cron";
import { exec } from "child_process";

const run = (cmd: string) =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });

export const backupDatabase = () => {
  cron.schedule("10 4 * * *", async () => {
    console.log("[CRON] MTSoft backup started");

    const date = new Date().toISOString().split("T")[0];
    const backupDir = "/var/www/mtsoft/backups";

    const gzBackupFile = `${backupDir}/mongo_backup_${date}.gz`;

    try {
      await run(`mongodump --gzip --archive=${gzBackupFile} --db=moderniTvora`);
      await run(`find ${backupDir} -name "*.gz" -mtime +7 -delete`);

      console.log("[CRON] MTSoft backup OK:", gzBackupFile);
    } catch (err) {
      console.error("[CRON] MTSoft backup failed:", err);
    }
  });
};
