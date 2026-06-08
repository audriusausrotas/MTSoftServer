import { calculateEstimate } from "./calculationsServices";
import { createProductionRecord, findProductionById } from "./productionService";
import {
  addProjectComment,
  changeCompletionDate,
  createProjectService,
  findProjectById,
} from "./projectService";
import { getUserById } from "./userServices";
import emit from "../sockets/emits";

export async function orderFence(body: any) {
  const { data, client, date, deliveryMethod, message, to, discount } = body;
  const user = await getUserById(to._id);

  const estimateData = {
    fences: data.fences,
    bindings: data.bindings,
  };
  const calculateEstimateResult = await calculateEstimate(estimateData);

  const fixedData = {
    client,
    fenceMeasures: data.fences,
    results: calculateEstimateResult.results,
    works: calculateEstimateResult.works,
    gates: {},
    totalPrice: calculateEstimateResult.totals.totalPrice,
    totalCost: calculateEstimateResult.totals.totalCost,
    totalProfit: calculateEstimateResult.totals.totalProfit,
    totalMargin: calculateEstimateResult.totals.totalMargin,
    priceVAT: calculateEstimateResult.totals.priceVAT,
    priceWithDiscount: calculateEstimateResult.totals.priceWithDiscount,
    discount: discount,
    status: "Naujas užsakymas",
    advance: 0,
    retail: false,
  };

  const result = await createProjectService(fixedData, user);

  await changeCompletionDate(result._id, date);

  await addProjectComment(
    result._id,
    `Kliento tel. nr: ${data.client.phone},  Pristatymo metodas:  ${deliveryMethod}`,
    client,
  );

  if (message) {
    await addProjectComment(result._id, message, client);
  }

  const production = await createProductionRecord(
    result,
    data.bindings,
    data.fences,
    data.comments,
    data.files,
  );

  emit.toAdmin("newExternalProduction", production);
  emit.toProduction("newExternalProduction", production);
  emit.toWarehouse("newExternalProduction", production);

  return result;
}

export async function orderAditionalFence(body: any) {
  const { projectOrderNr, message, data } = body;

  const production = await findProductionById(projectOrderNr);
  const project = await findProjectById(projectOrderNr);

  if (message)
    production.comments.push({
      date: new Date().toISOString(),
      comment: message,
      creator: production.client.username,
    });

  production.bindings = [
    ...(production?.bindings || []),
    {
      id: new Date().getTime().toString(),
      color: "",
      height: 0,
      name: "PAPILDOMAS UŽSAKYMAS",
      quantity: 0,
      postone: true,
    },
    ...data,
  ];

  await production.save();

  const estimateData = {
    fences: [],
    bindings: data,
  };
  const calculateEstimateResult = await calculateEstimate(estimateData);

  const defaultResult = {
    id: "",
    name: "---------- Naunas užsakymas ----------",
    price: 0,
    cost: 0,
    category: "",
    quantity: 0,
    height: 0,
    twoSided: "",
    direction: "",
    seeThrough: "",
    space: 0,
    color: "",
    totalPrice: 0,
    totalCost: 0,
    profit: 0,
    margin: 0,
    width: null,
    delivered: false,
    ordered: false,
    retail: false,
    units: false,
    material: "",
    manufacturer: "",
    auto: "",
    lock: "",
    installation: "",
  };

  const defaultWorks = {
    id: "",
    name: "---------- Naunas užsakymas ----------",
    quantity: 0,
    price: 0,
    cost: 0,
    totalCost: 0,
    totalPrice: 0,
    margin: 0,
    profit: 0,
    done: false,
    retail: false,
  };

  project.results = [...project.results, defaultResult, ...calculateEstimateResult.results];
  project.works = [...project.works, defaultWorks, ...calculateEstimateResult.works];
  project.totalPrice = project.totalPrice + calculateEstimateResult.totals.totalPrice;
  project.totalCost = project.totalCost + calculateEstimateResult.totals.totalCost;
  project.totalProfit = project.totalProfit + calculateEstimateResult.totals.totalProfit;
  project.totalMargin = (project.totalMargin + calculateEstimateResult.totals.totalMargin) / 2;
  project.priceVAT = project.priceVAT + calculateEstimateResult.totals.priceVAT;
  project.priceWithDiscount =
    project.priceWithDiscount + calculateEstimateResult.totals.priceWithDiscount;

  await project.save();

  emit.toAdmin("externalOrderUpdate", body);
  emit.toProduction("externalOrderUpdate", body);
  emit.toWarehouse("externalOrderUpdate", body);

  return;
}
