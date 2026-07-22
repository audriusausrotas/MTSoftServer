import { ReportSettings, ReportsGeneral } from "../data/interfaces";
import productionEventSchema from "../schemas/productionEventSchema";
import reportGeneralSettingsSchema from "../schemas/reportGeneralSettingsSchema";
import reportSettingsSchema from "../schemas/reportSettingsSchema";
import emit from "../sockets/emits";

export function createProductionReport() {
  return {
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
      M1: {
        bends: 0,
        holes: 0,
        shifts: {
          shift1: {
            bends: 0,
            holes: 0,
          },
          shift2: {
            bends: 0,
            holes: 0,
          },
        },
      },

      M2: {
        bends: 0,
        holes: 0,
        shifts: {
          shift1: {
            bends: 0,
            holes: 0,
          },
          shift2: {
            bends: 0,
            holes: 0,
          },
        },
      },
    },
  };
}

export function getLithuaniaDateRange(start: string, end: string) {
  return {
    start: new Date(`${start}T00:00:00+03:00`),
    end: new Date(`${end}T23:59:59.999+03:00`),
  };
}

export function getDateRangeDays(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function getBendCount(elementName: string, settings: ReportSettings[]) {
  const found = settings.find((item) =>
    elementName.toLowerCase().includes(item.keyword.toLowerCase()),
  );
  if (!found) return 0;
  return +found.bends;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getLithuaniaMinutes(date: Date) {
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
}

export function getShift(timestamp: Date, settings: ReportsGeneral): "shift1" | "shift2" | null {
  const currentMinutes = getLithuaniaMinutes(timestamp);

  const shift1Start = timeToMinutes(settings.workStart1);
  const shift1End = timeToMinutes(settings.workEnd1);
  const shift2Start = timeToMinutes(settings.workStart2);
  const shift2End = timeToMinutes(settings.workEnd2);

  if (currentMinutes >= shift1Start && currentMinutes < shift1End) return "shift1";
  if (currentMinutes >= shift2Start && currentMinutes < shift2End) return "shift2";
  return null;
}

export async function generateProductionReport(request: any) {
  const { user, year, month, day, weekStart, weekEnd, machine, search } = request;

  const filter: any = {};
  let selectedDays = 1;

  const isAll = (value: any) => {
    return (
      value === undefined ||
      value === null ||
      value === "" ||
      value.toString().toLowerCase() === "visi"
    );
  };

  if (search && search.trim() !== "") {
    filter.orderNumber = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  //USER FILTER
  if (!isAll(user)) {
    filter["user.email"] = user;
  }

  // MACHINE FILTER
  if (!isAll(machine)) {
    filter.machine = machine;
  }

  //DATE FILTER
  if (!isAll(weekStart) && !isAll(weekEnd)) {
    selectedDays = getDateRangeDays(weekStart, weekEnd);

    const start = new Date(`${weekStart}T00:00:00+03:00`);
    const end = new Date(`${weekEnd}T23:59:59.999+03:00`);

    filter.timestamp = {
      $gte: start,
      $lte: end,
    };
  } else if (!isAll(year)) {
    const selectedYear = Number(year);

    if (!isNaN(selectedYear)) {
      let start: Date;
      let end: Date;

      const selectedMonth = Number(month);
      const selectedDay = Number(day);

      // KONKRETI DIENA
      if (!isAll(month) && !isAll(day) && !isNaN(selectedMonth) && !isNaN(selectedDay)) {
        const monthString = String(selectedMonth).padStart(2, "0");
        const dayString = String(selectedDay).padStart(2, "0");
        start = new Date(`${selectedYear}-${monthString}-${dayString}T00:00:00+03:00`);
        end = new Date(`${selectedYear}-${monthString}-${dayString}T23:59:59.999+03:00`);
      } else if (!isAll(month) && !isNaN(selectedMonth)) {
        //VISAS MENESIS
        const monthString = String(selectedMonth).padStart(2, "0");
        start = new Date(`${selectedYear}-${monthString}-01T00:00:00+03:00`);
        const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
        const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
        end = new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+03:00`);
        end.setMilliseconds(end.getMilliseconds() - 1);
      } else {
        // VISI METAI
        start = new Date(`${selectedYear}-01-01T00:00:00+03:00`);
        end = new Date(`${selectedYear}-12-31T23:59:59.999+03:00`);
      }

      filter.timestamp = {
        $gte: start,
        $lte: end,
      };
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

  if (!generalSettings) throw new Error("Nerasti bendri ataskaitos nustatymai");

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

        production.kpi[machineKey].shifts[shift].bends += bends;
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
      const holes = quantity * holesCount;

      production.holes.shifts[shift].active = true;
      production.holes.shifts[shift].count += holes;
      production.holes.count += holes;

      if (event.machine === "Lenkimo staklės 1") {
        production.kpi.M1.holes += holes;
        production.kpi.M1.shifts[shift].holes += holes;
      }

      if (event.machine === "Lenkimo staklės 2") {
        production.kpi.M2.holes += holes;
        production.kpi.M2.shifts[shift].holes += holes;
      }

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

    const key = `${event.orderNumber}_` + `${email}_` + `${event.machine}_` + `${event.operation}`;

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
    production.cut.shifts.shift1.goal = generalSettings.cutGoal1 * selectedDays;

  if (production.cut.shifts.shift2.active)
    production.cut.shifts.shift2.goal = generalSettings.cutGoal2 * selectedDays;

  // BEND M1

  if (production.bend.M1.shifts.shift1.active)
    production.bend.M1.shifts.shift1.goal = generalSettings.bendGoal1M1 * selectedDays;

  if (production.bend.M1.shifts.shift2.active)
    production.bend.M1.shifts.shift2.goal = generalSettings.bendGoal2M1 * selectedDays;

  // BEND M2

  if (production.bend.M2.shifts.shift1.active)
    production.bend.M2.shifts.shift1.goal = generalSettings.bendGoal1M2 * selectedDays;

  if (production.bend.M2.shifts.shift2.active)
    production.bend.M2.shifts.shift2.goal = generalSettings.bendGoal2M2 * selectedDays;

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
  const hasWorkerWithBend = workersList.some((worker: any) => worker.didBend && worker.didHoles);

  if (hasWorkerWithBend) holesMultiplier = +generalSettings.holesIndex;

  if (production.holes.shifts.shift1.active)
    production.holes.shifts.shift1.goal = generalSettings.holesGoal1 * selectedDays;

  if (production.holes.shifts.shift2.active)
    production.holes.shifts.shift2.goal = generalSettings.holesGoal2 * selectedDays;

  /*
        ======================
             TOTAL DATA
        ======================

        Čia jau formuojame tai,
        ką gaus frontend
      */

  const kpi = {
    total: 0,
    M1: {
      total: production.kpi.M1.bends + production.kpi.M1.holes * +generalSettings.holesIndex,
      shifts: {
        shift1:
          production.kpi.M1.shifts.shift1.bends +
          production.kpi.M1.shifts.shift1.holes * +generalSettings.holesIndex,
        shift2:
          production.kpi.M1.shifts.shift2.bends +
          production.kpi.M1.shifts.shift2.holes * +generalSettings.holesIndex,
      },
    },

    M2: {
      total: production.kpi.M2.bends + production.kpi.M2.holes * +generalSettings.holesIndex,
      shifts: {
        shift1:
          production.kpi.M2.shifts.shift1.bends +
          production.kpi.M2.shifts.shift1.holes * +generalSettings.holesIndex,
        shift2:
          production.kpi.M2.shifts.shift2.bends +
          production.kpi.M2.shifts.shift2.holes * +generalSettings.holesIndex,
      },
    },
  };

  kpi.total = kpi.M1.total + kpi.M2.total;

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
  return {
    totalData,
    data: Object.values(detailReport),
  };
}

export async function buildEventForReport(event: any) {
  const data = { machine: "", operation: "", quantity: 0 };

  if (event.operation === "cut") {
    data.machine = event.machine;
    data.operation = event.operation;
    data.quantity = event.element.quantity * event.element.length;
  }

  if (event.operation === "done") {
    const bendSettings: ReportSettings[] = await reportSettingsSchema.find();

    let machineKey: any = null;
    if (event.machine === "Lenkimo staklės 1") machineKey = "M1";
    if (event.machine === "Lenkimo staklės 2") machineKey = "M2";

    if (machineKey) {
      const bends = getBendCount(event.element?.name || "", bendSettings) * event.element.quantity;

      data.machine = event.machine;
      data.operation = event.operation;
      data.quantity = bends;
    }
  }

  if (event.operation === "holes") {
    const holes = event.element.quantity * event.element?.holesCount;
    let holesMultiplier = 1;

    if (event.machine === "Lenkimo staklės 1" || event.machine === "Lenkimo staklės 2") {
      const generalSettings = await reportGeneralSettingsSchema.findOne();

      if (generalSettings) {
        holesMultiplier = generalSettings.holesIndex;
      }
    }

    data.machine = event.machine;
    data.operation = event.operation;
    data.quantity = holes * holesMultiplier;
  }

  if (event.operation === "defect") {
    data.machine = event.machine;
    data.operation = event.operation;
    data.quantity = event.element.quantity;
  }

  emit.toScreen("addData", data);
  //sita istrint jei bus atskiras screeno useris
  emit.toAdmin("addData", data);
}
