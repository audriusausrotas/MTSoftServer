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

  console.log(calculateEstimateResult);

  const fixedData = {
    client,
    fenceMeasures: data.fences,
    results: calculateEstimateResult.results,
    works: calculateEstimateResult.works,
    gates: {},
    totalPrice: calculateEstimateResult.totalPrice,
    totalCost: calculateEstimateResult.totalCost,
    totalProfit: calculateEstimateResult.totalProfit,
    totalMargin: calculateEstimateResult.totalMargin,
    priceVAT: calculateEstimateResult.priceVAT,
    priceWithDiscount: calculateEstimateResult.priceWithDiscount,
    discount: discount,
    status: "Matavimas",
    advance: 0,
    retail: false,
  };

  const result = await createProjectService(fixedData, user);

  return { success: true, result, message: "Fence order received" };
}
