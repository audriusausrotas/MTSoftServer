import type {
  Fence,
  Measure,
  Fences,
  Works,
  Calculations,
  Result,
  Product,
  FenceSetup,
  Gates,
  Gate,
  OtherParts,
  DefaultValues,
} from "../data/interfaces";
import { getProductPrices, getGatePrices, getFencePrices } from "./priceServices";
import { getDefaultValues } from "./settingsServices";
import { v4 as uuidv4 } from "uuid";

////////////////////////////////////////////////////////
///                    Main Funcion                  ///
////////////////////////////////////////////////////////

export async function calculateEstimate(body: any, user: any) {
  const { calculations } = body;

  const backup = calculations.backup;

  console.log(backup);

  const [productPrices, fencePrices, gatePrices, defaultValues] = await Promise.all([
    getProductPrices(),
    getFencePrices(),
    getGatePrices(),
    getDefaultValues(),
  ]);

  const results = calculateResults(fencePrices, calculations, defaultValues[0]);

  const calculatedData = generateResults(
    results,
    defaultValues[0],
    calculations,
    backup,
    productPrices,
    fencePrices,
    gatePrices,
  );

  const calculatedTotals = calculateTotals({
    results: calculatedData.results,
    works: calculatedData.works,
  });
  calculatedData.totals = calculatedTotals;

  return calculatedData;
}

////////////////////////////////////////////////////////
///                 calculate results                ///
////////////////////////////////////////////////////////

export function calculateResults(
  fencePrices: FenceSetup[],
  calculations: Calculations,
  defaultValues: DefaultValues,
) {
  const data: any = {
    fences: [] as Fences[],
    totalFences: 0 as number,
    totalFencesWithBindings: 0 as number,
    totalFenceboards: 0 as number,
    poles: [] as OtherParts[],
    totalPoles: 0 as number,
    anchoredPoles: [] as OtherParts[],
    totalAnchoredPoles: 0 as number,
    gatePoles: [] as OtherParts[],
    anchoredGatePoles: [] as OtherParts[],
    totalAnchoredGatePoles: 0 as number,
    totalGatePoles: 0 as number,
    borders: 0 as number,
    totalBorders: 0 as number,
    borderHolders: [] as OtherParts[],
    crossbars: [] as OtherParts[],
    totalCrossbars: 0 as number,
    crossbarHolders: [] as OtherParts[],
    rivets: [] as OtherParts[],
    bolts: [] as OtherParts[],
    totalElements: 0 as number,
    totalHoles: 0 as number,
    bindingsLength: [] as OtherParts[],
    segments: [] as OtherParts[],
    totalSegments: 0 as number,
    segmentHolders: [] as OtherParts[],
    gates: [] as Gate[],
    retailLegs: [] as OtherParts[],
  };

  const addPart = (
    array: OtherParts[],
    color: string,
    quantity: number,
    height: number,
    name?: string,
  ) => {
    let tempArr = [...array];
    let itemExist = false;
    for (const item of tempArr) {
      if (item.color === color && height === item.height && item.name === name) {
        item.quantity += quantity;
        itemExist = true;
      }
    }
    if (!itemExist) {
      tempArr.push({ color, quantity, height, name });
    }
    return tempArr;
  };

  for (const item of calculations.fences) {
    const fenceSettings = fencePrices.find((fence) => fence.name === item.name);

    if (!fenceSettings) return;

    // checks what is needed
    const anchoredPoles = item.anchoredPoles === "Taip";
    const onlyParts = item.services === "Tik Medžiagos";
    const onlyServices = item.services === "Tik Montavimas";
    const isSegment: boolean = fenceSettings?.category === "Segmentas";
    const isFenceboard: boolean = fenceSettings?.category === "Tvoralentė";
    const polesNeeded: boolean =
      item.parts !== "Tik Borteliai" && item.parts !== "Be Bortelių Ir Stulpų";
    const bordersNeeded: boolean =
      item.parts !== "Tik Stulpai" &&
      item.parts !== "Be Bortelių Ir Stulpų" &&
      item.anchoredPoles === "Ne";

    // calculate horizontal fence by suare meters
    if (fenceSettings?.category === "Tvora") {
      const temp = calculateHorizontalFence(data.fences, item, calculations.units);

      if (!onlyServices) data.fences = [...temp];
      if (!onlyParts) {
        if (item.bindings === "Taip") data.totalFencesWithBindings += item.totalQuantity;
        else data.totalFences += item.totalQuantity;
      }
    }

    let isTogether: boolean = false;
    let lastBindingHeight: number = 0;

    for (const measure of item.measures) {
      const isFence = !measure.gates.exist && !measure.kampas.exist && !measure.laiptas.exist;

      //calculate holes
      if (item.holes === "Taip" && fenceSettings.category === "Tvora") {
        data.totalHoles += measure.elements * fenceSettings.details.holes;
      }

      // calculate gates

      if (measure.gates.exist) {
        data.gates.push({
          _id: uuidv4(),
          name: measure.gates.name,
          auto: measure.length > 200 ? measure.gates.automatics : "",
          width: measure.length,
          height: measure.height,
          installation: measure.gates.installation,
          color: item.color,
          filling: item.name,
          ready: false,
          bankette:
            measure.length! > 200 && measure.gates.option === "Stumdomi"
              ? measure.gates.bankette
              : "",

          comment: measure.gates.comment,
          direction: measure.length! < 200 ? measure.gates.direction : "",
          lock: measure.length! < 200 ? measure.gates.lock : "",
          option: measure.gates.option,
        });
      }

      // calculate fenceboard fence
      if (isFenceboard) {
        const temp = calculateFenceboardFence(
          item,
          measure,
          data.fences,
          fenceSettings.details.width,
        );
        if (!onlyServices) data.fences = [...temp.arr];
        if (!onlyParts) data.totalFenceboards += temp.quantity;
      }

      // calculate total elements
      if (!isSegment) {
        if (!onlyServices) data.totalElements += measure.elements;
        if (isFenceboard) {
          data.bolts = addPart(data.bolts, item.color, Math.ceil(measure.elements) * 4, 0);
        } else {
          data.rivets = addPart(data.rivets, item.color, Math.ceil(measure.elements) * 4, 0);
        }

        // calculate bindings

        if (item.direction === "Horizontali" && item.bindings === "Taip") {
          if (!onlyServices) {
            if (data.bindingsLength.length === 0 && calculations.retail) {
              data.bindingsLength = addPart(data.bindingsLength, item.color, measure.height * 2, 0);
            }
            data.bindingsLength = addPart(data.bindingsLength, item.color, measure.height * 2, 0);
          }
          if (!onlyServices && !calculations.retail) lastBindingHeight = measure.height;
        }
      }

      // calculate wholesale legs
      if (!calculations.retail) {
        if (fenceSettings.category === "Tvora" && !measure.gates.exist) {
          const name =
            item.bindings === "Taip"
              ? defaultValues.retailSingleLeg
              : defaultValues.retailDoubleLeg;
          data.retailLegs = addPart(data.retailLegs, item.color, measure.height * 2, 0, name);
        }
      }

      // calculate borders, crossbars
      if (isFence) {
        // calculate crossbars
        if (isFenceboard) {
          if (!onlyServices) {
            data.crossbars = addPart(data.crossbars, item.color, 2, 0);
            data.crossbarHolders = addPart(data.crossbarHolders, item.color, 4, 0);
            if (!onlyParts) data.totalCrossbars += 2;
          }
        }
        // calculate borders
        if (bordersNeeded) {
          if (!onlyServices) {
            data.borders++;
            data.borderHolders = addPart(data.borderHolders, item.color, 2, 0);
          }
          if (!onlyParts) data.totalBorders++;
        }

        // calculate segment

        if (isSegment) {
          if (!onlyServices) {
            data.segments = addPart(
              data.segments,
              item.color,
              Math.ceil(measure.length / 255),
              +measure.height,
              item.name,
            );
            const holdersCount = +measure.height < 130 ? 2 : 3;
            if (data.segmentHolders.length === 0)
              data.segmentHolders = addPart(data.segmentHolders, item.color, holdersCount, 0);

            data.segmentHolders = addPart(data.segmentHolders, item.color, holdersCount, 0);
          }
          if (!onlyParts) data.totalSegments++;
        }
      }

      // calculate poles

      if (polesNeeded) {
        // if gates
        if (measure.gates.exist) {
          if (!isTogether) {
            if (!onlyServices && measure.gates.option !== "Segmentiniai") {
              if (anchoredPoles) {
                data.anchoredPoles = data.anchoredPoles.map((i: OtherParts) => {
                  if (i.color === item.color) i.quantity--;
                  return i;
                });
                data.anchoredGatePoles = addPart(data.anchoredGatePoles, item.color, 2, 3);
              } else {
                data.poles = data.poles.map((i: OtherParts) => {
                  if (item.color === i.color) i.quantity--;
                  return i;
                });
                data.gatePoles = addPart(data.gatePoles, item.color, 2, 3);
              }
            }

            if (!onlyParts) {
              if (anchoredPoles) {
                data.totalAnchoredPoles--;
                data.totalAnchoredGatePoles += 2;
              } else {
                data.totalPoles--;
                data.totalGatePoles += 2;
              }
            }
          } else {
            if (!onlyServices)
              anchoredPoles
                ? (data.anchoredGatePoles = addPart(data.anchoredGatePoles, item.color, 1, 3))
                : (data.gatePoles = addPart(data.gatePoles, item.color, 1, 3));

            if (!onlyParts)
              anchoredPoles ? (data.totalAnchoredGatePoles += 1) : (data.totalGatePoles += 1);
          }
          isTogether = true;
        } else {
          // if fence
          if (!isFence) return;

          if (!onlyServices)
            if (anchoredPoles) {
              let quantity = 0;
              if (data.anchoredPoles.length === 0 && data.anchoredGatePoles.length === 0)
                quantity++;
              const doesExist = data.anchoredPoles.some((i: OtherParts) => item.color === i.color);
              if (!doesExist) quantity++;
              if (quantity === 0) quantity++;
              data.anchoredPoles = addPart(
                data.anchoredPoles,
                item.color,
                quantity,
                measure.height,
              );
            } else {
              let quantity = 0;
              if (data.poles.length === 0 && data.gatePoles.length === 0) quantity++;
              const doesExist = data.poles.some(
                (i: OtherParts) => item.color === i.color && item.name === i.name,
              );
              if (!doesExist) quantity++;
              if (quantity === 0) quantity++;

              data.poles = addPart(
                data.poles,
                item.color,
                quantity,
                3,
                isSegment ? defaultValues.poleAlt : defaultValues.poleMain,
              );
            }

          if (data.totalPoles === 0 && !onlyParts)
            anchoredPoles ? data.totalAnchoredPoles++ : data.totalPoles++;

          if (!onlyParts) anchoredPoles ? data.totalAnchoredPoles++ : data.totalPoles++;

          isTogether = false;
        }
      }
    }

    if (!isSegment && !onlyServices && item.bindings === "Taip")
      if (data.bindingsLength.length === 0 && calculations.retail) {
        data.bindingsLength = addPart(
          data.bindingsLength,
          item.color,
          (lastBindingHeight + 0.1) * 2,
          0,
        );
      }
  }
  return data;
}

////////////////////////////////////////////////////////
///               Generate Results                  ///
////////////////////////////////////////////////////////

export function generateResults(
  results: any,
  defaultValues: DefaultValues,
  calculations: Calculations,
  backupData: any,
  productPrices: Product[],
  fencePrices: FenceSetup[],
  gatePrices: Gates[],
) {
  const data: any = { results: [], works: [] };

  if (results.fences.length > 0) {
    let cork = 0;

    for (const item of results.fences) {
      const temp = createResultElement(
        item,
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);

      //generate holes
      if (results.totalHoles > 0) {
        const temp = createWorkElement(
          {
            name: defaultValues.holesWork,
            quantity: results.totalHoles,
          },
          calculations,
          backupData,
          productPrices,
        );

        data.works.push(temp);
      }

      if (item.name.includes("Dilė")) {
        cork += item.quantity;
      }
    }

    if (cork > 0) {
      const temp = createResultElement(
        {
          name: defaultValues.dileCork,
          quantity: cork,
          color: 9005,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.segments.length > 0) {
    for (const item of results.segments) {
      const temp = createResultElement(
        {
          ...item,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.segmentHolders.length > 0) {
    for (const item of results.segmentHolders) {
      const temp = createResultElement(
        {
          ...item,
          name: defaultValues.segmentHolders,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.poles.length > 0) {
    for (const item of results.poles) {
      const temp = createResultElement(
        {
          ...item,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.gatePoles.length > 0) {
    let pole = "";
    const exist = results.gates.some((item: any) => item.name === "Varstomi");
    if (exist) {
      pole = defaultValues.gatePoleAlt;
    } else {
      pole = defaultValues.gatePoleMain;
    }

    for (const item of results.gatePoles) {
      const temp = createResultElement(
        {
          ...item,
          name: pole,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.anchoredPoles.length > 0) {
    for (const item of results.anchoredPoles) {
      let pole = "";
      if (item.height <= 150) {
        pole = defaultValues.anchoredPoleMain;
      } else {
        pole = defaultValues.anchoredPoleAlt;
      }

      const temp = createResultElement(
        { ...item, name: pole },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );

      data.results.push(temp);
    }
  }

  if (results.anchoredGatePoles.length > 0) {
    let pole = "";
    const exist = results.gates.some((item: any) => item.name === "Varstomi");
    if (exist) {
      pole = defaultValues.anchoredGatePoleAlt;
    } else {
      pole = defaultValues.anchoredGatePoleMain;
    }

    for (const item of results.anchoredGatePoles) {
      const temp = createResultElement(
        { ...item, name: pole },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.borders > 0) {
    const temp = createResultElement(
      {
        name: defaultValues.border,
        quantity: results.borders,
      },
      calculations,
      backupData,
      productPrices,
      fencePrices,
      gatePrices,
    );
    data.results.push(temp);

    for (const item of results.borderHolders) {
      const temp = createResultElement(
        {
          ...item,
          name: defaultValues.borderHolder,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.crossbars.length > 0) {
    for (const item of results.crossbars) {
      const temp = createResultElement(
        {
          ...item,
          name: defaultValues.crossbar,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
    for (const item of results.crossbarHolders) {
      const temp = createResultElement(
        {
          ...item,
          name: defaultValues.crossbarHolders,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.rivets.length > 0) {
    for (const item of results.rivets) {
      const boxQuantity = Math.ceil((item.quantity + item.quantity * 0.1) / 1000);
      const temp = createResultElement(
        {
          ...item,
          name: defaultValues.rivets,
          quantity: boxQuantity,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );

      data.results.push(temp);
    }
  }

  if (results.bolts.length > 0) {
    for (const item of results.bolts) {
      const boxQuantity = Math.ceil((item.quantity + item.quantity * 0.1) / 1000);
      const temp = createResultElement(
        {
          ...item,
          name: defaultValues.bolts,
          quantity: boxQuantity,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.retailLegs.length > 0) {
    for (const item of results.retailLegs) {
      const temp = createResultElement(
        {
          ...item,
          quantity: item.quantity / 100,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.bindingsLength.length > 0) {
    for (const item of results.bindingsLength) {
      const temp = createResultElement(
        {
          ...item,
          name: calculations.retail ? defaultValues.bindings : defaultValues.retailBindings,
          quantity: item.quantity / 100,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.gates.length > 0) {
    const gates = gatePrices;

    for (const item of results.gates) {
      if (item.option === "Segmentiniai") {
        if (item.name === "Varteliai") {
          const name = `${defaultValues.smallGatesSegment} 100x${
            Math.floor(item.height / 10) * 10
          }`;

          const temp = createResultElement(
            {
              ...item,
              name: name,
              quantity: 1,
            },
            calculations,
            backupData,
            productPrices,
            fencePrices,
            gatePrices,
          );

          data.results.push(temp);

          const work = createWorkElement(
            {
              name: defaultValues.segmentGatesWork,
              quantity: 1,
            },
            calculations,
            backupData,
            productPrices,
          );
          data.works.push(work);
        } else {
          const name = `${defaultValues.gateSegment} ${
            Math.ceil(item.width / 100) * 100
          }x${Math.floor(item.height / 10) * 10}`;

          const temp = createResultElement(
            {
              ...item,
              name: name,
              quantity: 1,
            },
            calculations,
            backupData,
            productPrices,
            fencePrices,
            gatePrices,
          );

          data.results.push(temp);

          const work = createWorkElement(
            {
              name: defaultValues.segmentGateWork,
              quantity: 1,
            },
            calculations,
            backupData,
            productPrices,
          );

          data.works.push(work);
        }
        return;
      }

      const length = Math.ceil(item.width / 100) * 100;
      const gate = gates.find(
        (gate) =>
          gate.category.toLowerCase() ===
            item.option.replace("Gaminami", "Varteliai").toLowerCase() && length === gate.length,
      );

      if (!gate) return;

      const temp = createResultElement(
        {
          ...item,
          name: gate.name,
          quantity: 1,
        },
        calculations,
        backupData,
        productPrices,
        fencePrices,
        gatePrices,
      );

      data.results.push(temp);
    }
  }

  // calculate works

  if (results.totalFences > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.fenceWork,
        quantity: results.totalFences,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.totalFencesWithBindings > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.totalFencesWithBindings,
        quantity: results.totalFencesWithBindings,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.totalFenceboards > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.fenceboardWork,
        quantity: results.totalFenceboards,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.totalPoles > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.polesWork,
        quantity: results.totalPoles,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.totalGatePoles > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.gatesPoleWork,
        quantity: results.totalGatePoles,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.totalAnchoredPoles > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.anchoredPolesWork,
        quantity: results.totalAnchoredPoles,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.totalAnchoredGatePoles > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.anchoredGatePolesWork,
        quantity: results.totalAnchoredGatePoles,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.totalBorders > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.bordersWork,
        quantity: results.totalBorders,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.totalCrossbars > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.crossbarWork,
        quantity: results.totalCrossbars,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.totalSegments > 0) {
    const work = createWorkElement(
      {
        name: defaultValues.segmentWork,
        quantity: results.totalSegments,
      },
      calculations,
      backupData,
      productPrices,
    );
    data.works.push(work);
  }

  if (results.gates.length > 0) {
    let quantity = 0;

    results.gates.forEach((item: any) => {
      if (item.bankette === "Taip" && item.option.includes("Stumdomi")) {
        quantity +=
          item.width <= 500
            ? 2
            : item.width <= 600
              ? 2.5
              : item.width <= 700
                ? 3
                : item.width <= 800
                  ? 3.5
                  : item.width <= 900
                    ? 4
                    : 5;
      }
    });

    if (quantity > 0) {
      const work = createWorkElement(
        {
          name: defaultValues.gateBnkette,
          quantity,
        },
        calculations,
        backupData,
        productPrices,
      );
      data.works.push(work);
    }
  }

  const work = createWorkElement(
    {
      name: defaultValues.transport,
      quantity: 1,
    },
    calculations,
    backupData,
    productPrices,
  );
  data.works.push(work);

  if (backupData?.backupExist) {
    const tempResults = backupData.results.filter(
      (item: any) => !data.results.some((itm: any) => itm.name === item.name),
    );
    const tempWorks = backupData.works.filter(
      (item: any) => !data.works.some((itm: any) => itm.name === item.name),
    );

    for (const item of tempResults) {
      data.results.push(item);
    }

    for (const item of tempWorks) {
      data.works.push(item);
    }
  }

  return data;
}

////////////////////////////////////////////////////////
///               Create Works                       ///
////////////////////////////////////////////////////////

export function createWorkElement(
  item: { name: string; quantity: number },
  calculations: Calculations,
  backupData: any,
  productPrices: Product[],
) {
  const product: any = getProductPrice(item.name, productPrices);
  const retail = calculations.retail;

  const backupExist = backupData?.backupExist;
  const backup = backupData?.works?.find(
    (i: any) => i.name.toLowerCase().trim() === item.name.toLowerCase().trim(),
  );

  let cost = 0;
  let price = 0;

  if (!product) return;

  if (backupExist && backup && backup.retail === retail) {
    cost = backup.cost;
    price = backup.price;
  } else {
    cost = product.prices.cost;
    price = retail ? product.prices.priceRetail : product.prices.priceWholesale;
  }

  let quantity = +item.quantity.toFixed(2);

  if (item.name.toLowerCase() === "transportas" && backupExist && backup) {
    quantity = backup.quantity;
  }

  const totalPrice = +(price * quantity).toFixed(2);
  const totalCost = +(cost * quantity).toFixed(2);
  const profit = +(totalPrice - totalCost).toFixed(2);
  const margin = +(Math.round((profit / totalPrice) * 10000) / 100).toFixed(2);

  const resultData: Works = {
    id: uuidv4(),
    name: item.name,
    quantity,
    price,
    totalPrice,
    cost,
    totalCost,
    profit,
    margin,
    done: false,
    retail,
  };

  return resultData;
}

////////////////////////////////////////////////////////
///               Create elements                    ///
////////////////////////////////////////////////////////

export function createResultElement(
  item: any,
  calculations: Calculations,
  backupData: any,
  productPrices: Product[],
  fencePrices: FenceSetup[],
  gatePrices: Gates[],
) {
  const retail = calculations.retail;
  const units = calculations.units;
  const backupExist = backupData?.backupExist;
  const backup = backupData?.results?.find(
    (i: any) => i.name.toLowerCase().trim() === item.name.toLowerCase().trim(),
  );

  let cost = 0;
  let price = 0;

  let product: any = getProductPrice(item.name, productPrices);

  if (product) {
    if (backupExist && backup && backup.retail === retail && units === backup.units) {
      cost = backup.cost;
      price = backup.price;
    } else {
      cost = product.prices.cost;
      price = retail ? product.prices.priceRetail : product.prices.priceWholesale;
    }
  } else {
    product = getFencePrice(item.name, fencePrices);
    if (!product) product = getGatePrice(item.name, gatePrices);

    if (!product) return;

    const retailCheck = backup?.retail === retail || null;
    const checkName = item.name.toLowerCase().trim() === backup?.name.toLowerCase().trim() || null;

    // calculate gate price
    if (
      product?.category === "stumdomi" ||
      product?.category === "varstomi" ||
      product?.category === "varteliai" ||
      product?.category === "segmentiniai"
    ) {
      if (
        backupExist &&
        backup &&
        retailCheck &&
        checkName &&
        backup.width === item.width &&
        backup.width === item.height &&
        backup.auto === item.auto &&
        backup.lock === item.lock &&
        backup.installation === item.installation
      ) {
        cost = backup.cost;
        price = backup.price;
      } else {
        const isRetail = retail ? "priceRetail" : "priceWholesale";
        const lockName = item.lock.toLowerCase().replace(" ", "_").replace(".", "");

        cost = product.prices.cost.frame || 0;
        if (item.auto === "Taip") cost += product.prices.cost.automation || 0;
        if (item.installation === "Taip") cost += product.prices.cost.installation || 0;
        cost += product.prices.cost[lockName] || 0;

        price = product.prices[isRetail].frame || 0;
        if (item.auto === "Taip") price += product.prices[isRetail].automation || 0;
        if (item.installation === "Taip") price += product.prices[isRetail].installation || 0;
        price += product.prices[isRetail][lockName] || 0;
      }
      // calculate fence price
    } else if (product?.category === "Tvora") {
      const checkSeethrough = item.seeThrough === backup?.seeThrough || null;
      const checkManufacturer = backup?.manufacturer === item.manufacturer || null;
      const checkUnits = units === backup?.units || null;

      if (
        backupExist &&
        backup &&
        checkSeethrough &&
        checkManufacturer &&
        retailCheck &&
        checkName &&
        checkUnits
      ) {
        cost = backup.cost;
        price = backup.price;
      } else {
        const fenceRename = units
          ? String(item.seeThrough)
              .replace("š", "s")
              .replace("25% Pramatomumas", "pramatoma25")
              .replace("50% Pramatomumas", "pramatoma50")
              .toLowerCase()
          : "meter";

        const source =
          item.manufacturer === "Ukraina" ? product.prices.eco : product.prices.premium;

        const fenceData = source[fenceRename as keyof typeof source];

        cost = +fenceData.cost;
        price = retail ? +fenceData.priceRetail : +fenceData.priceWholesale;
      }
      // if fenceboard
    } else if (product.category === "Tvoralentė") {
      price = +(
        ((retail ? product.prices.priceRetail : product.prices.priceWholesale) * item.height) /
        100
      ).toFixed(2);
      cost = +((product.prices.cost * item.height) / 100).toFixed(2);

      // other parts
    } else {
      price = retail ? +product.prices.priceRetail : +product.prices.priceWholesale;
      cost = +product.prices.cost;
    }
  }

  const totalPrice = +(price * item.quantity).toFixed(2);
  const totalCost = +(cost * item.quantity).toFixed(2);
  const profit = +(totalPrice - totalCost).toFixed(2);
  const margin = +(Math.round((profit / totalPrice) * 10000) / 100).toFixed(2);

  const resultData: Result = {
    id: uuidv4(),
    name: item.name,
    quantity: +item.quantity.toFixed(2),
    color: item.color || "",
    height: item.height || 0,
    space: item.space || 0,
    twoSided: item.twoSided || "",
    direction: item.direction || "",
    seeThrough: item.seeThrough || "",
    price: +price.toFixed(2),
    totalPrice: +totalPrice.toFixed(2),
    cost: +cost.toFixed(2),
    totalCost: +totalCost.toFixed(2),
    profit: +profit.toFixed(2),
    margin: +margin,
    category: product.category || "",
    width: item.width || 0,
    delivered: false,
    ordered: false,
    retail,
    units,
    material: item.material || "",
    manufacturer: item.manufacturer || "",
    auto: item.auto,
    lock: item.lock,
    installation: item.installation,
  };

  return resultData;
}

////////////////////////////////////////////////////////
///               Get Product Price                  ///
////////////////////////////////////////////////////////

export function getProductPrice(name: string, products: Product[]): Product | null {
  return (
    products.find((product) => product.name.toLowerCase().trim() === name.toLowerCase().trim()) ||
    null
  );
}

////////////////////////////////////////////////////////
///               Get Fence Price                    ///
////////////////////////////////////////////////////////

export function getFencePrice(name: string, fences: FenceSetup[]): FenceSetup | null {
  return (
    fences.find((fence) => fence.name.toLowerCase().trim() === name.toLowerCase().trim()) || null
  );
}

////////////////////////////////////////////////////////
///               Get Gate Price                     ///
////////////////////////////////////////////////////////

export function getGatePrice(name: string, gates: Gates[]): Gates | null {
  return gates.find((gate) => gate.name.toLowerCase().trim() === name.toLowerCase().trim()) || null;
}

////////////////////////////////////////////////////////
///               Calculate Product Price            ///
////////////////////////////////////////////////////////

export function calculateProductPrice(cost: number, profit: number) {
  if (cost === 0 || profit === 0) return 0;
  return +(cost / ((100 - profit) / 100)).toFixed(2);
}

////////////////////////////////////////////////////////
///               Calculate Fence Price              ///
////////////////////////////////////////////////////////

export function calculateFencePrice(step: number, price: number, legPrice: number) {
  return (((100 / step) * 2.5 * price + legPrice * 2) / 2.5).toFixed(2);
}

////////////////////////////////////////////////////////
///               Calculate Fence Boards             ///
////////////////////////////////////////////////////////

export function calculateFenceBoards(
  length: number,
  space: number,
  fenceWidth: number,
  twoSided: string,
) {
  const elementsTemp = Math.round(length / (fenceWidth + space));

  return twoSided === "Taip" ? elementsTemp * 2 - 1 : elementsTemp;
}

////////////////////////////////////////////////////////
///               Calculate Fenceboard Fence         ///
////////////////////////////////////////////////////////

export function calculateFenceboardFence(
  item: Fence,
  measure: Measure,
  fenceTemp: Fences[],
  fenceboardWidth: number,
) {
  const tempFence: Fences[] = [...fenceTemp];
  let fenceExist: boolean = false;

  const elements = calculateFenceBoards(
    item.direction === "Vertikali" ? measure.length : measure.height,
    item.space,
    fenceboardWidth,
    item.twoSided,
  );

  const convertedHeight = item.direction === "Vertikali" ? measure.height : measure.length;

  const initialFenceData = {
    name: item.name,
    color: item.color,
    length: 0,
    height: convertedHeight,
    quantity: 0,
    elements: 0,
    material: item.material,
    manufacturer: item.manufacturer,
    space: item.space,
    seeThrough: "",
    direction: item.direction,
    twoSided: item.twoSided,
  };

  tempFence.forEach((fenceItem) => {
    if (
      fenceItem.name === item.name &&
      fenceItem.color === item.color &&
      fenceItem.material === item.material &&
      fenceItem.manufacturer === item.manufacturer &&
      fenceItem.space === item.space &&
      fenceItem.direction === item.direction &&
      fenceItem.height === convertedHeight
    ) {
      fenceItem.elements += elements;
      fenceItem.quantity += elements;
      fenceExist = true;
    }
  });

  if (!fenceExist) {
    initialFenceData.elements = elements;
    initialFenceData.quantity = elements;
    tempFence.push(initialFenceData);
  }

  return { arr: tempFence, quantity: elements };
}

////////////////////////////////////////////////////////
///               Calculate Horizontal Fence         ///
////////////////////////////////////////////////////////

export function calculateHorizontalFence(
  fenceTemp: Fences[],
  item: Fence,
  units: boolean,
): Fences[] {
  const tempFence: Fences[] = [...fenceTemp];

  let fenceExist: boolean = false;

  if (item.services === "Tik Montavimas") return tempFence;

  const initialFenceData = {
    ...item,
    length: item.totalLength,
    height: 0,
    quantity: units ? item.totalQuantity : calculateWholesale(item),
    elements: 0,
  };

  tempFence.forEach((fenceItem) => {
    if (
      fenceItem.name === item.name &&
      fenceItem.color === item.color &&
      fenceItem.material === item.material &&
      fenceItem.manufacturer === item.manufacturer &&
      fenceItem.space === item.space &&
      fenceItem.seeThrough === item.seeThrough &&
      fenceItem.direction === item.direction
    ) {
      if (units) {
        fenceItem.length += item.totalLength || 0;
        fenceItem.quantity += item.totalQuantity || 0;

        fenceItem.elements += item.elements || 0;
      } else {
        fenceItem.quantity += calculateWholesale(item);
      }
      fenceExist = true;
    }
  });

  if (!fenceExist) {
    tempFence.push(initialFenceData);
  }

  return tempFence;
}

////////////////////////////////////////////////////////
///               Calculate Wholesale                ///
////////////////////////////////////////////////////////

function calculateWholesale(item: Fence) {
  let tempTotalElements = 0;
  item.measures.forEach((element) => {
    tempTotalElements += (element.length / 100) * element.elements;
  });
  return tempTotalElements;
}

const calculateTotals = (data: any) => {
  let totalPrice: number = 0;
  let totalCost: number = 0;
  let totalProfit: number = 0;

  for (const item of data.results) {
    totalPrice += item.totalPrice;
    totalCost += item.totalCost;
    totalProfit += item.profit;
  }

  for (const item of data.works) {
    totalPrice += item.totalPrice;
    totalCost += item.totalCost;
    totalProfit += item.profit;
  }

  const priceVAT = totalPrice * 1.21;
  const margin = ((totalPrice - totalCost) / totalPrice) * 100;
  const calculatedDiscount = totalPrice + (priceVAT - totalPrice) / 2;

  return {
    totalPrice: +totalPrice.toFixed(2),
    totalCost: +totalCost.toFixed(2),
    totalProfit: +totalProfit.toFixed(2),
    totalMargin: +margin.toFixed(2),
    priceVAT: +priceVAT.toFixed(2),
    priceWithDiscount: +calculatedDiscount.toFixed(2),
  };
};
