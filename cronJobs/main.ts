import { backupDatabase } from "./databaseBackup";
import { clearSchedule } from "./clearSchedule";
import { clearUnconfirmed } from "./clearUnconfirmed";

backupDatabase();
clearSchedule();
clearUnconfirmed();

console.log("Cron jobs initialized...");
