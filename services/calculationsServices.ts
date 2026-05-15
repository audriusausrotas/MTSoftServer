import type {
  Fence,
  Measure,
  Fences,
  Works,
  Calculations,
  Project,
  Result,
  Product,
  FenceSetup,
  Gates,
} from "../data/interfaces";
import { getProductPrices, getGatePrices, getFencePrices } from "./priceServices";
import { v4 as uuidv4 } from "uuid";

export async function calculateEstimate(body: any, user: any) {
  const { calculations } = body.calculations;

  const productPrices = await getProductPrices();
  const fencePrices = await getFencePrices();
  const gatePrices = await getGatePrices();

  let fenceTemp: Fence[] = [];

  return {
    success: true,
    data: body,
    user: user,
  };
}

export async function createWorkElement(
  item: { name: string; quantity: number },
  calculations: Calculations,
  backupData: any,
  productPrices: Product[],
) {
  const product: any = getProductPrice(item.name, productPrices);
  const retail = calculations.retail;

  const backupExist = backupData.backupExist;
  const backup = backupData.works.find(
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

export default function createResultElement(
  item: any,
  calculations: Calculations,
  backupData: any,
  productPrices: Product[],
  fencePrices: FenceSetup[],
  gatePrices: Gates[],
) {
  const retail = calculations.retail;
  const units = calculations.units;

  const backupExist = backupData.backupExist;
  const backup = backupData.results.find(
    (i: any) => i.name.toLowerCase().trim() === item.name.toLowerCase().trim(),
  );

  let product: any = getProductPrice(item.name, productPrices);
  let cost = 0;
  let price = 0;

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

export async function getProductPrice(name: string, products: Product[]): Promise<Product | null> {
  return (
    products.find((product) => product.name.toLowerCase().trim() === name.toLowerCase().trim()) ||
    null
  );
}

export async function getFencePrice(
  name: string,
  fences: FenceSetup[],
): Promise<FenceSetup | null> {
  return (
    fences.find((fence) => fence.name.toLowerCase().trim() === name.toLowerCase().trim()) || null
  );
}

export async function getGatePrice(name: string, gates: Gates[]): Promise<Gates | null> {
  return gates.find((gate) => gate.name.toLowerCase().trim() === name.toLowerCase().trim()) || null;
}

export async function calculateProductPrice(cost: number, profit: number) {
  if (cost === 0 || profit === 0) return 0;
  return +(cost / ((100 - profit) / 100)).toFixed(2);
}

export async function calculateFencePrice(step: number, price: number, legPrice: number) {
  return (((100 / step) * 2.5 * price + legPrice * 2) / 2.5).toFixed(2);
}

export async function calculateFenceBoards(
  length: number,
  space: number,
  fenceWidth: number,
  twoSided: string,
) {
  const elementsTemp = Math.round(length / (fenceWidth + space));

  return twoSided === "Taip" ? elementsTemp * 2 - 1 : elementsTemp;
}

export async function calculateFenceboardFence(
  item: Fence,
  measure: Measure,
  fenceTemp: Fences[],
  fenceboardWidth: number,
) {
  const tempFence: Fences[] = [...fenceTemp];
  let fenceExist: boolean = false;

  const elements = await calculateFenceBoards(
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

export async function calculateHorizontalFence(fenceTemp: Fences[], item: Fence, units: boolean) {
  const tempFence: Fences[] = [...fenceTemp];

  let fenceExist: boolean = false;

  if (item.services === "Tik Montavimas") return;

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

function calculateWholesale(item: Fence) {
  let tempTotalElements = 0;
  item.measures.forEach((element) => {
    tempTotalElements += (element.length / 100) * element.elements;
  });
  return tempTotalElements;
}
