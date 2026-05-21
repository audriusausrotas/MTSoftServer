import { calculateEstimate } from "./calculationsServices";
import { addProjectComment, changeCompletionDate, createProjectService } from "./projectService";
import { getUserById } from "./userServices";

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
    `Kliento nr: ${data.client.phone || "11111"}, Pristatymo metodas: ${deliveryMethod}`,
    client,
  );

  if (message) {
    await addProjectComment(result._id, message, client);
  }

  // idet gamyba

  return result;
}
