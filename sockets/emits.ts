import { io } from "./main";

export default {
  toAdmin: (event: string, data: any) => {
    io.to("admin-room").emit(event, data);
  },
  toProduction: (event: string, data: any) => {
    io.to("production-room").emit(event, data);
  },
  toInstallation: (event: string, data: any) => {
    io.to("installation-room").emit(event, data);
  },
  toWarehouse: (event: string, data: any) => {
    io.to("warehouse-room").emit(event, data);
  },
  toGates: (event: string, data: any) => {
    io.to("gates-room").emit(event, data);
  },
  toEveryone: (event: string, data: any) => {
    io.emit(event, data);
  },
};
