import productionEventSchema from "../schemas/productionEventSchema";
import response from "../modules/response";
import { ReportSettings, ReportsGeneral } from "../data/interfaces";
import reportSettingsSchema from "../schemas/reportSettingsSchema";
import reportGeneralSettingsSchema from "../schemas/reportGeneralSettingsSchema";

/**
 * Convertuoja HH:mm į minutes
 */
const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Pagal event laiką nustato pamainą
 */

const getLithuaniaMinutes = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("lt-LT", {
    timeZone: "Europe/Vilnius",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);

  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);

  return hour * 60 + minute;
};

const getShift = (timestamp: Date, settings: ReportsGeneral): "shift1" | "shift2" | null => {
  const currentMinutes = getLithuaniaMinutes(timestamp);

  const shift1Start = timeToMinutes(settings.workStart1);
  const shift1End = timeToMinutes(settings.workEnd1);

  const shift2Start = timeToMinutes(settings.workStart2);
  const shift2End = timeToMinutes(settings.workEnd2);

  if (currentMinutes >= shift1Start && currentMinutes < shift1End) {
    return "shift1";
  }

  if (currentMinutes >= shift2Start && currentMinutes < shift2End) {
    return "shift2";
  }

  return null;
};

/**
 * Suranda kiek lenkimų turi detalė
 */
const getBendCount = (elementName: string, settings: ReportSettings[]) => {
  const found = settings.find((item) =>
    elementName.toLowerCase().includes(item.keyword.toLowerCase()),
  );

  if (!found) return 0;
  return +found.bends;
};

/**
 * Pradinis KPI objektas
 *
 * Čia laikome pamainas,
 * nes tikslai priklauso nuo
 * staklės + pamaina
 */
const createProductionReport = () => ({
  cut: {
    quantity: 0,
    meters: 0,
    shifts: {
      shift1: {
        active: false,
        meters: 0,
        goal: 0,
      },
      shift2: {
        active: false,
        meters: 0,
        goal: 0,
      },
    },
  },

  bend: {
    M1: {
      bends: 0,
      meters: 0,
      quantity: 0,
      shifts: {
        shift1: {
          active: false,
          bends: 0,
          meters: 0,
          goal: 0,
        },
        shift2: {
          active: false,
          bends: 0,
          meters: 0,
          goal: 0,
        },
      },
    },

    M2: {
      bends: 0,
      meters: 0,
      quantity: 0,
      shifts: {
        shift1: {
          active: false,
          bends: 0,
          meters: 0,
          goal: 0,
        },
        shift2: {
          active: false,
          bends: 0,
          meters: 0,
          goal: 0,
        },
      },
    },
  },

  holes: {
    count: 0,
    shifts: {
      shift1: {
        active: false,
        count: 0,
        goal: 0,
      },
      shift2: {
        active: false,
        count: 0,
        goal: 0,
      },
    },
  },
  defects: {
    quantity: 0,

    shifts: {
      shift1: {
        active: false,
        quantity: 0,
      },

      shift2: {
        active: false,
        quantity: 0,
      },
    },
  },

  selfCost: 0,

  kpi: {
    M1: { bends: 0, holes: 0 },
    M2: { bends: 0, holes: 0 },
  },
});

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

      /*
        Paieška pagal užsakymo numerį
      */
      if (search && search.trim() !== "") {
        filter.orderNumber = {
          $regex: search.trim(),
          $options: "i",
        };
      } else {
        /*
          Filtras pagal darbuotoją
        */
        if (!isAll(user)) {
          filter["user.email"] = user;
        }
        /*
          Filtras pagal stakles
        */
        if (!isAll(machine)) {
          filter.machine = machine;
        }
        /*
          Filtras pagal datą
        */
        if (!isAll(year)) {
          const selectedYear = Number(year);

          if (!isNaN(selectedYear)) {
            let start: Date;
            let end: Date;
            const selectedMonth = Number(month);
            const selectedDay = Number(day);

            if (!isAll(month) && !isNaN(selectedMonth)) {
              const realMonth = selectedMonth - 1;
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

      const events: any = await productionEventSchema
        .find(filter)
        .sort({
          timestamp: 1,
        })
        .lean();

      const bendSettings: ReportSettings[] = await reportSettingsSchema.find();

      const generalSettings = await reportGeneralSettingsSchema.findOne();

      if (!generalSettings) {
        return response(res, false, null, "Nerasti bendri ataskaitos nustatymai");
      }

      const production: any = createProductionReport();
      const detailReport: any = {};
      const workers: any = {};

      for (const event of events) {
        const shift = getShift(new Date(event.timestamp), generalSettings);

        // Jeigu eventas nepatenka į pamainą
        // jo neskaičiuojame
        if (!shift) {
          continue;
        }

        const quantity = Number(event.element?.quantity || 0);
        const length = Number(event.element?.length || 0);
        const holesCount = Number(event.element?.holesCount || 0);
        const email = event.user?.email;
        /*
          Darbuotojų trackingas.
          Reikalingas skylučių tikslui.
        */
        if (email) {
          if (!workers[email]) {
            workers[email] = {
              didBend: false,
              didHoles: false,
            };
          }
        }

        /*
          ======================
             LENKIMAS
          ======================
        */

        if (event.operation === "done") {
          let machineKey: any = null;
          if (event.machine === "Lenkimo staklės 1") machineKey = "M1";
          if (event.machine === "Lenkimo staklės 2") machineKey = "M2";

          if (machineKey) {
            const bends = getBendCount(event.element?.name || "", bendSettings) * quantity;
            const bendMeters =
              getBendCount(event.element?.name || "", bendSettings) * quantity * length;

            production.bend[machineKey].shifts[shift].active = true;
            production.bend[machineKey].shifts[shift].bends += bends;
            production.bend[machineKey].shifts[shift].meters += bendMeters;
            production.bend[machineKey].bends += bends;
            production.bend[machineKey].quantity += quantity;
            production.bend[machineKey].meters += bendMeters;
            production.kpi[machineKey].bends += bends;

            if (email) {
              workers[email].didBend = true;
            }
          }
        }

        /*
          ======================
              PJOVIMAS
          ======================
        */

        if (event.operation === "cut") {
          production.cut.shifts[shift].active = true;
          production.cut.shifts[shift].meters += quantity * length;
          production.cut.meters += quantity * length;
          production.cut.quantity += quantity;
        }

        /*
          ======================
             SKYLIŲ MUŠIMAS
          ======================
        */

        if (event.operation === "holes") {
          production.holes.shifts[shift].active = true;
          production.holes.shifts[shift].count += quantity * holesCount;
          production.holes.count += quantity * holesCount;

          if (event.machine === "Lenkimo staklės 1")
            production.kpi.M1.holes += quantity * holesCount;
          if (event.machine === "Lenkimo staklės 2")
            production.kpi.M2.holes += quantity * holesCount;

          if (email) workers[email].didHoles = true;
        }

        if (event.operation === "defect") {
          production.defects.shifts[shift].active = true;
          production.defects.shifts[shift].quantity += quantity;
          production.defects.quantity += quantity;
        }

        /*
          ======================
          DETALUS REPORTAS
          ======================

          Čia išsaugome tavo seną
          informaciją frontendui:
          order, user, machine,
          elementus ir t.t.
        */

        const key =
          `${event.orderNumber}_` + `${email}_` + `${event.machine}_` + `${event.operation}`;

        if (!detailReport[key]) {
          detailReport[key] = {
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

        const row = detailReport[key];

        const bendCount =
          event.operation === "done" ? getBendCount(event.element?.name || "", bendSettings) : 0;
        row.totalQuantity += quantity;
        row.totalLength += quantity * length;
        row.totalBends += bendCount * quantity;
        row.totalBendLength += bendCount * quantity * length;
        row.totalHoles += quantity * holesCount;

        row.elements.push({
          name: event.element?.name || "",
          quantity,
          holesCount,
          length,
          bends: bendCount * quantity,
          bendLength: bendCount * quantity * length,
          location: event.element?.location || null,
          timestamp: event.timestamp,
        });
      }

      /*
        ======================
          TIKSLŲ PRISKYRIMAS
        ======================

        Tik toms pamainoms,
        kurios realiai dirbo
      */

      // CUT

      if (production.cut.shifts.shift1.active)
        production.cut.shifts.shift1.goal = generalSettings.cutGoal1;

      if (production.cut.shifts.shift2.active)
        production.cut.shifts.shift2.goal = generalSettings.cutGoal2;

      // BEND M1

      if (production.bend.M1.shifts.shift1.active)
        production.bend.M1.shifts.shift1.goal = generalSettings.bendGoal1M1;

      if (production.bend.M1.shifts.shift2.active)
        production.bend.M1.shifts.shift2.goal = generalSettings.bendGoal2M1;

      // BEND M2

      if (production.bend.M2.shifts.shift1.active)
        production.bend.M2.shifts.shift1.goal = generalSettings.bendGoal1M2;

      if (production.bend.M2.shifts.shift2.active)
        production.bend.M2.shifts.shift2.goal = generalSettings.bendGoal2M2;

      /*
        ======================
              HOLES GOAL
        ======================

        Jeigu žmogus toje dienoje
        lenkė ir mušė skyles,
        jam taikomas holesIndex
      */

      let holesMultiplier = 1;

      const workersList = Object.values(workers);
      const hasWorkerWithBend = workersList.some(
        (worker: any) => worker.didBend && worker.didHoles,
      );

      if (hasWorkerWithBend) holesMultiplier = +generalSettings.holesIndex;

      if (production.holes.shifts.shift1.active)
        production.holes.shifts.shift1.goal = generalSettings.holesGoal1;

      if (production.holes.shifts.shift2.active)
        production.holes.shifts.shift2.goal = generalSettings.holesGoal2;

      /*
        ======================
             TOTAL DATA
        ======================

        Čia jau formuojame tai,
        ką gaus frontend
      */

      const kpi = {
        M1: production.kpi.M1.bends + production.kpi.M1.holes * +generalSettings.holesIndex,
        M2: production.kpi.M2.bends + production.kpi.M2.holes * +generalSettings.holesIndex,
      };

      const totalData = {
        cut: {
          meters: production.cut.meters / 100,
          quantity: production.cut.quantity,
          goal: production.cut.shifts.shift1.goal + production.cut.shifts.shift2.goal,
          shifts: production.cut.shifts,
        },

        bend: {
          M1: {
            bends: production.bend.M1.bends,
            meters: production.bend.M1.meters / 100,
            goal: production.bend.M1.shifts.shift1.goal + production.bend.M1.shifts.shift2.goal,
            shifts: production.bend.M1.shifts,
          },

          M2: {
            bends: production.bend.M2.bends,
            meters: production.bend.M2.meters / 100,
            goal: production.bend.M2.shifts.shift1.goal + production.bend.M2.shifts.shift2.goal,
            shifts: production.bend.M2.shifts,
          },

          total: {
            bends: production.bend.M1.bends + production.bend.M2.bends,
            quantity: production.bend.M1.quantity + production.bend.M2.quantity,
            meters: production.bend.M1.meters / 100 + production.bend.M2.meters / 100,
            goal:
              production.bend.M1.shifts.shift1.goal +
              production.bend.M1.shifts.shift2.goal +
              (production.bend.M2.shifts.shift1.goal + production.bend.M2.shifts.shift2.goal),
          },
        },

        holes: {
          count: production.holes.count,
          goal: production.holes.shifts.shift1.goal + production.holes.shifts.shift2.goal,
          shifts: production.holes.shifts,
        },

        defects: {
          quantity: production.defects.quantity,
          target: generalSettings.defectPercentage,
          percentage:
            (production.defects.quantity /
              (production.bend.M1.bends + production.bend.M2.bends + production.defects.quantity)) *
            100,
          shifts: production.defects.shifts,
        },

        /*
          Savikaina:

          išlenkti metrai *
          bendCost
        */

        selfCost: {
          value:
            (production.bend.M1.meters / 100 + production.bend.M2.meters / 100) *
              +generalSettings.bendCost +
            production.holes.count * +generalSettings.holesCost,
          target: generalSettings.costTarget,
        },

        kpi,
      };

      const responseData = {
        totalData,
        data: Object.values(detailReport),
      };

      return response(res, true, responseData, "");
    } catch (error) {
      console.error("Klaida:", error);

      return response(res, false, null, "Serverio klaida");
    }
  },
};
