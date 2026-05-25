import { calculateEstimate } from "./calculationsServices";
import { createProductionRecord } from "./productionService";
import { addProjectComment, changeCompletionDate, createProjectService } from "./projectService";
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
