import productionEventSchema from "../schemas/productionEventSchema";
import response from "../modules/response";
import { ReportSettings } from "../data/interfaces";
import reportSettingsSchema from "../schemas/reportSettingsSchema";

export default {
  getProductionReport: async (req: any, res: any) => {
    try {
      const { user, year, month, day, machine, search } = req.body;

      const filter: any = {};

      const isAll = (value: any) => {
        return (
          value === undefined ||
          value === null ||
          value === "" ||
          value.toString().toLowerCase() === "visi"
        );
      };

      // Paieška
      if (search && search.trim() !== "") {
        filter.orderNumber = {
          $regex: search.trim(),
          $options: "i",
        };
      } else {
        // User
        if (!isAll(user)) {
          filter["user.email"] = user;
        }

        // Machine
        if (!isAll(machine)) {
          filter.machine = machine;
        }

        // Data
        if (!isAll(year)) {
          const selectedYear = Number(year);

          if (!isNaN(selectedYear)) {
            let start: Date;
            let end: Date;

            const selectedMonth = Number(month);
            const selectedDay = Number(day);

            /*
              Metai + mėnuo + diena
            */
            if (!isAll(month) && !isNaN(selectedMonth)) {
              const realMonth = selectedMonth - 1;

              /*
                Konkreti diena
              */
              if (!isAll(day) && !isNaN(selectedDay)) {
                start = new Date(selectedYear, realMonth, selectedDay, 0, 0, 0, 0);

                end = new Date(selectedYear, realMonth, selectedDay, 23, 59, 59, 999);
              } else {
                start = new Date(selectedYear, realMonth, 1, 0, 0, 0, 0);
                end = new Date(selectedYear, realMonth + 1, 0, 23, 59, 59, 999);
              }
            } else {
              start = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
              end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
            }

            filter.timestamp = {
              $gte: start,
              $lte: end,
            };
          }
        }
      }

      const events = await productionEventSchema
        .find(filter)
        .sort({
          timestamp: 1,
        })
        .lean();

      const report: any = {};

      const bendData: ReportSettings[] = await reportSettingsSchema.find();

      for (const event of events) {
        const key =
          `${event.orderNumber}_` +
          `${event.user?.email}_` +
          `${event.machine}_` +
          `${event.operation}`;

        if (!report[key]) {
          report[key] = {
            orderNumber: event.orderNumber,
            user: event.user,
            machine: event.machine || "",
            operation: event.operation || "",
            totalQuantity: 0,
            totalLength: 0,
            totalBends: 0,
            totalBendLength: 0,
            totalHoles: 0,
            elements: [],
          };
        }

        const row = report[key];

        const quantity = Number(event.element?.quantity || 0);
        const length = Number(event.element?.length || 0);
        const hoolesCount = Number(event.element?.holesCount || 0);
        let bendCount: number = 0;

        if (event.operation === "done") {
          const bendDataFound = bendData.find((bend) =>
            event.element?.name?.toLowerCase().includes(bend.keyword.toLowerCase()),
          );

          if (bendDataFound) bendCount = Number(bendDataFound?.bends);
        }

        row.totalQuantity += quantity;
        row.totalLength += quantity * length;
        row.totalBends += bendCount * quantity;
        row.totalBendLength += bendCount * quantity * length;
        row.totalHoles += quantity * hoolesCount;

        row.elements.push({
          name: event.element?.name || "",
          quantity: Number(event.element?.quantity || 0),
          holesCount: Number(event.element?.holesCount || 0),
          length: Number(event.element?.length || 0),
          bends: bendCount * quantity,
          bendLength: bendCount * length * quantity,
          location: event.element?.location || null,
          timestamp: event.timestamp,
        });
      }

      const data = { totalCut: 0, totalBend: 0, totalHoles: 0, totalDefect: 0 };

      Object.values(report).forEach((item: any) => {
        if (item.operation === "cut") data.totalCut += item.totalLength / 100;
        if (item.operation === "done") data.totalBend += item.totalBends;
        if (item.operation === "holes") data.totalHoles += item.totalHoles;
        if (item.operation === "defect") data.totalDefect += item.totalQuantity;
      });

      const responseData = { totalData: data, data: Object.values(report) };

      return response(res, true, responseData, "");
    } catch (error) {
      console.error("Klaida:", error);

      return response(res, false, null, "Serverio klaida");
    }
  },
};
