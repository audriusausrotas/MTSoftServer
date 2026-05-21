import { calculateEstimate } from "./calculationsServices";
import { createProjectService } from "./projectService";
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
    status: "Matavimas",
    advance: 0,
    retail: false,
  };

  const result = await createProjectService(fixedData, user);
  if (!result) throw new Error("Failed to create project");

  return result;
}
