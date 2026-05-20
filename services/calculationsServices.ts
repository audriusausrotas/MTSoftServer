import type {
  Fence,
  Measure,
  Fences,
  Works,
  Calculations,
  Result,
  Product,
  FenceSetup,
  OtherParts,
  DefaultValues,
} from "../data/interfaces";
import { getProductPrices, getFencePrices } from "./priceServices";
import { getDefaultValues } from "./settingsServices";
import { v4 as uuidv4 } from "uuid";

////////////////////////////////////////////////////////
///                    Main Funcion                  ///
////////////////////////////////////////////////////////

export async function calculateEstimate(body: any) {
  const { calculations } = body;

  const [productPrices, fencePrices, defaultValues] = await Promise.all([
    getProductPrices(),
    getFencePrices(),
    getDefaultValues(),
  ]);

  const results = calculateResults(fencePrices, calculations, defaultValues[0]);

  const calculatedData = generateResults(results, defaultValues[0], productPrices, fencePrices);

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

const calculateResults = (
  fencePrices: FenceSetup[],
  calculations: Calculations,
  defaultValues: DefaultValues,
) => {
  const data: any = {
    fences: [] as Fences[],
    totalFences: 0 as number,
    totalFencesWithBindings: 0 as number,
    totalFenceboards: 0 as number,
    totalElements: 0 as number,
    totalHoles: 0 as number,
    retailLegs: [] as OtherParts[],
    rivets: [] as OtherParts[],
    bindingsLength: [] as OtherParts[],
  };

  for (const item of calculations.fences) {
    const fenceSettings = fencePrices.find((fence) => fence.name === item.name);

    if (!fenceSettings) throw new Error("Fence settings not found");

    // calculate horizontal fence by suare meters
    if (fenceSettings?.category === "Tvora") {
      const temp = calculateHorizontalFence(data.fences, item);
      data.fences = [...temp];
    }

    for (const measure of item.measures) {
      //calculate holes
      if (item.holes === "Taip" && fenceSettings.category === "Tvora") {
        data.totalHoles += measure.elements * fenceSettings.details.holes;
      }

      // calculate total elements

      data.totalElements += measure.elements;
      data.rivets = addPart(data.rivets, item.color, Math.ceil(measure.elements) * 4, 0);

      // calculate bindings

      if (item.direction === "Horizontali" && item.bindings === "Taip") {
        if (data.bindingsLength.length === 0 && calculations.retail) {
          data.bindingsLength = addPart(data.bindingsLength, item.color, measure.height * 2, 0);
        }
        data.bindingsLength = addPart(data.bindingsLength, item.color, measure.height * 2, 0);
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
    }
  }
  return data;
};

////////////////////////////////////////////////////////
///               Generate Results                  ///
////////////////////////////////////////////////////////

const generateResults = (
  results: any,
  defaultValues: DefaultValues,
  productPrices: Product[],
  fencePrices: FenceSetup[],
) => {
  const data: any = { results: [], works: [] };

  if (results.fences.length > 0) {
    let cork = 0;

    for (const item of results.fences) {
      const temp = createResultElement(item, productPrices, fencePrices);
      data.results.push(temp);

      //generate holes
      if (results.totalHoles > 0) {
        const temp = createWorkElement(
          {
            name: defaultValues.holesWork,
            quantity: results.totalHoles,
          },
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
        productPrices,
        fencePrices,
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
        productPrices,
        fencePrices,
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
        productPrices,
        fencePrices,
      );
      data.results.push(temp);
    }
  }

  if (results.bindingsLength.length > 0) {
    for (const item of results.bindingsLength) {
      const temp = createResultElement(
        {
          ...item,
          name: defaultValues.retailBindings,
          quantity: item.quantity / 100,
        },
        productPrices,
        fencePrices,
      );
      data.results.push(temp);
    }
  }

  // calculate works

  const work = createWorkElement(
    {
      name: defaultValues.transport,
      quantity: 1,
    },
    productPrices,
  );
  data.works.push(work);

  return data;
};

////////////////////////////////////////////////////////
///               Create Works                       ///
////////////////////////////////////////////////////////

const createWorkElement = (item: { name: string; quantity: number }, productPrices: Product[]) => {
  const product: any = getProductPrice(item.name, productPrices);

  let cost = 0;
  let price = 0;

  if (!product) return;

  cost = product.prices.cost;
  price = product.prices.priceWholesale;

  let quantity = +item.quantity.toFixed(2);

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
    retail: false,
  };

  return resultData;
};

////////////////////////////////////////////////////////
///               Create elements                    ///
////////////////////////////////////////////////////////

const createResultElement = (item: any, productPrices: Product[], fencePrices: FenceSetup[]) => {
  let cost = 0;
  let price = 0;

  let product: any = getProductPrice(item.name, productPrices);

  if (product) {
    cost = product.prices.cost;
    price = product.prices.priceWholesale;
  } else {
    product = getFencePrice(item.name, fencePrices);

    if (product) {
      if (product?.category === "Tvora") {
        const fenceData =
          item.manufacturer === "Ukraina" ? product.prices.eco.meter : product.prices.premium.meter;

        cost = +fenceData.cost;
        price = +fenceData.priceWholesale;

        // if fenceboard
      } else if (product.category === "Tvoralentė") {
        price = +((product.prices.priceWholesale * item.height) / 100).toFixed(2);
        cost = +((product.prices.cost * item.height) / 100).toFixed(2);
      }
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
    retail: false,
    units: false,
    material: item.material || "",
    manufacturer: item.manufacturer || "",
    auto: item.auto,
    lock: item.lock,
    installation: item.installation,
  };

  return resultData;
};

////////////////////////////////////////////////////////
///               Add Part Function                  ///
////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////
///               Get Product Price                  ///
////////////////////////////////////////////////////////

const getProductPrice = (name: string, products: Product[]): Product | null => {
  return (
    products.find((product) => product.name.toLowerCase().trim() === name.toLowerCase().trim()) ||
    null
  );
};

////////////////////////////////////////////////////////
///               Get Fence Price                    ///
////////////////////////////////////////////////////////

const getFencePrice = (name: string, fences: FenceSetup[]): FenceSetup | null => {
  return (
    fences.find((fence) => fence.name.toLowerCase().trim() === name.toLowerCase().trim()) || null
  );
};

////////////////////////////////////////////////////////
///               Calculate Product Price            ///
////////////////////////////////////////////////////////

const calculateProductPrice = (cost: number, profit: number) => {
  if (cost === 0 || profit === 0) return 0;
  return +(cost / ((100 - profit) / 100)).toFixed(2);
};

////////////////////////////////////////////////////////
///               Calculate Fence Price              ///
////////////////////////////////////////////////////////

const calculateFencePrice = (step: number, price: number, legPrice: number) => {
  return (((100 / step) * 2.5 * price + legPrice * 2) / 2.5).toFixed(2);
};

////////////////////////////////////////////////////////
///               Calculate Fence Boards             ///
////////////////////////////////////////////////////////

const calculateFenceBoards = (
  length: number,
  space: number,
  fenceWidth: number,
  twoSided: string,
) => {
  const elementsTemp = Math.round(length / (fenceWidth + space));

  return twoSided === "Taip" ? elementsTemp * 2 - 1 : elementsTemp;
};

////////////////////////////////////////////////////////
///               Calculate Fenceboard Fence         ///
////////////////////////////////////////////////////////

const calculateFenceboardFence = (
  item: Fence,
  measure: Measure,
  fenceTemp: Fences[],
  fenceboardWidth: number,
) => {
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
};

////////////////////////////////////////////////////////
///               Calculate Horizontal Fence         ///
////////////////////////////////////////////////////////

const calculateHorizontalFence = (fenceTemp: Fences[], item: Fence): Fences[] => {
  const tempFence: Fences[] = [...fenceTemp];
  let fenceExist: boolean = false;

  const initialFenceData = {
    ...item,
    length: item.totalLength,
    height: 0,
    quantity: calculateWholesale(item),
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
      fenceItem.quantity += calculateWholesale(item);

      fenceExist = true;
    }
  });

  if (!fenceExist) {
    tempFence.push(initialFenceData);
  }

  return tempFence;
};

////////////////////////////////////////////////////////
///               Calculate Wholesale                ///
////////////////////////////////////////////////////////

const calculateWholesale = (item: Fence) => {
  let tempTotalElements = 0;
  item.measures.forEach((element) => {
    tempTotalElements += (element.length / 100) * element.elements;
  });
  return tempTotalElements;
};

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
