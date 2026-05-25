import type {
  Fence,
  Measure,
  Fences,
  Works,
  Result,
  Product,
  FenceSetup,
  OtherParts,
  DefaultValues,
  Bindings,
} from "../data/interfaces";
import { getProductPrices, getFencePrices } from "./priceServices";
import { getDefaultValues } from "./settingsServices";
import { v4 as uuidv4 } from "uuid";

////////////////////////////////////////////////////////
///                    Main Funcion                  ///
////////////////////////////////////////////////////////

export async function calculateEstimate(data: any) {
  const { fences, bindings } = data;

  const [productPrices, fencePrices, defaultValues] = await Promise.all([
    getProductPrices(),
    getFencePrices(),
    getDefaultValues(),
  ]);

  const results = calculateResults(fencePrices, fences, bindings, defaultValues[0]);

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
  fences: Fence[],
  bindings: Bindings[],
  defaultValues: DefaultValues,
) => {
  const data: any = {
    fences: [] as Fences[],
    totalFences: 0,
    totalElements: 0,
    totalHoles: 0,
    rivets: [] as OtherParts[],
    bindings: [] as OtherParts[],
  };
  let manufacturer = "";

  const pushFence = (item: any) => {
    const existing = data.fences.find(
      (fence: any) =>
        fence.name === item.name &&
        fence.color === item.color &&
        fence.material === item.material &&
        fence.manufacturer === item.manufacturer,
    );

    if (existing) {
      existing.quantity += item.quantity;
      existing.elements += item.elements;
      existing.length += item.length;
    } else {
      data.fences.push({
        ...item,
        quantity: item.quantity,
        elements: item.elements,
        length: item.length,
      });
    }
    data.totalFences += item.quantity;
    manufacturer = item.manufacturer;
  };

  const addRivets = (color: string, quantity: number) => {
    const existing = data.rivets.find((r: OtherParts) => r.color === color);

    if (existing) {
      existing.quantity += quantity;
    } else {
      data.rivets.push({ color, quantity });
    }
  };

  const pushElements = (item: any) => {
    // const existing = data.elementsTemp.find(
    //   (element: any) =>
    //     element.name.toLowerCase() === item.name.toLowerCase() && element.color === item.color,
    // );
    // if (existing) {
    //   existing.length += item.length;
    // } else {
    //   data.elementsTemp.push({
    //     ...item,
    //     length: item.length,
    //   });
    // }
  };

  const pushBindings = (item: any) => {
    const existing = data.bindings.find(
      (binding: any) =>
        binding.name.toLowerCase() === item.name.toLowerCase() && binding.color === item.color,
    );

    if (existing) {
      existing.length += item.length;
    } else {
      data.bindings.push({
        ...item,
        length: item.length,
      });
    }
  };

  for (const item of fences) {
    const fenceSettings = fencePrices.find((fence) => fence.name === item.name);
    if (!fenceSettings) throw new Error("Fence settings not found");

    console.log(item);

    if (fenceSettings.category === "Tvora") {
      let totalQuantity = 0;
      let totalElements = 0;
      let rivets = 0;

      for (const measure of item.measures) {
        totalQuantity += (measure.length / 100) * measure.elements;
        totalElements += measure.elements;
      }

      if (item.holes === "Taip") {
        data.totalHoles += totalElements * fenceSettings.details.holes;
        rivets += Math.ceil(totalElements) * 4;
      }

      if (rivets) addRivets(item.color, rivets);

      const initialFenceData = {
        ...item,
        length: item.totalLength,
        height: 0,
        quantity: totalQuantity,
        elements: totalElements,
      };

      pushFence(initialFenceData);
    }
  }

  for (const binding of bindings) {
    const totalLength = (binding.height || 0) * (binding.quantity || 0);

    let bindingName = "";
    let lengthMultiplier = 1;

    const isUkraine = manufacturer === "Ukranina";

    switch (binding.category) {
      case "koja":
        bindingName = isUkraine ? defaultValues.retailSingleLegEco : defaultValues.retailSingleLeg;
        break;

      case "dviguba":
        bindingName = isUkraine ? defaultValues.retailDoubleLegEco : defaultValues.retailDoubleLeg;
        break;

      case "centrinis":
        bindingName = isUkraine ? defaultValues.retailBindingsEco : defaultValues.retailBindings;
        break;

      case "galinis":
        bindingName = isUkraine ? defaultValues.retailBindingsEco : defaultValues.retailBindingsEco;
        lengthMultiplier = 2;
        break;

      case "elka":
        bindingName = isUkraine ? defaultValues.retailBindingsEco : defaultValues.retailBindings;
        lengthMultiplier = 0.5;
        break;

      case "kampas":
        bindingName = isUkraine ? defaultValues.retailBindingsEco : defaultValues.retailBindings;
        break;

      case "elementas":
        bindingName = "Nestandartinis elementas";
        break;

      default:
        bindingName = "Nestandartinis lankstinys";
        break;
    }

    const length = (totalLength * lengthMultiplier) / 100;

    if (binding.category === "elementas") {
      // pushElements({
      //   name: bindingName,
      //   color: binding.color,
      //   length,
      // });
      pushBindings({
        name: bindingName,
        color: binding.color,
        length,
      });
    } else {
      pushBindings({
        name: bindingName,
        color: binding.color,
        length,
      });
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

  let manufacturer = "";

  if (results.fences.length > 0) {
    let cork = 0;

    // 1. Generate fence products
    for (const item of results.fences) {
      if (!manufacturer) {
        manufacturer = item.manufacturer;
      }
      const temp = createResultElement(item, productPrices, fencePrices);
      data.results.push(temp);

      if (item.name.includes("Dilė")) {
        cork += item.quantity;
      }
    }

    // 2. Generate holes
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

    // 3. Generate cork
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

  // 4. Rivets
  if (results.rivets.length > 0) {
    for (const item of results.rivets) {
      const boxQuantity = Math.ceil((item.quantity + item.quantity * 0.05) / 1000);
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

  // 5. Bindings
  if (results.bindings.length > 0) {
    for (const item of results.bindings) {
      const temp = createResultElement(
        {
          ...item,
          name: item.name,
          quantity: item.length,
        },
        productPrices,
        fencePrices,
      );
      data.results.push(temp);
    }
  }

  // 6. Transport work
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
      } else if (product?.category === "Tvoralentė") {
        price = +((product.prices.priceWholesale * item.height) / 100).toFixed(2);
        cost = +((product.prices.cost * item.height) / 100).toFixed(2);
      }
    }
  }

  const totalPrice = +(price * item.quantity).toFixed(2);
  const totalCost = +(cost * item.quantity).toFixed(2);
  const profit = +(totalPrice - totalCost).toFixed(2);
  const margin = totalPrice > 0 ? +(Math.round((profit / totalPrice) * 10000) / 100).toFixed(2) : 0;

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
    category: product?.category || "",
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
