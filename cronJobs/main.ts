import { backupDatabase } from "./databaseBackup";
import { clearSchedule } from "./clearSchedule";
import { clearUnconfirmed } from "./clearUnconfirmed";
import { databaseBackupToAtlas } from "./databaseBackupToAtlas";
import { deleteDeleted } from "./deleteDeleted";
import { deleteUnconfirmed } from "./deleteUnconfirmed";

clearSchedule();
clearUnconfirmed();
deleteDeleted();
deleteUnconfirmed();
backupDatabase();
databaseBackupToAtlas();

console.log("Cron jobs initialized...");
