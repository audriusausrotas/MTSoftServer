import { calculateEstimate } from "./calculationsServices";
import { createProjectService } from "./projectService";
import { getUserById } from "./userServices";

export async function orderFence(body: any) {
  const { orderData, fenceData } = body;
  console.log("orderFence veikia");
  console.log(body);
  const user = await getUserById(orderData.to._id);

  const estimateData = {
    fences: fenceData.fences,
    retail: false,
    units: false,
    backup: null,
  };

  const calculateEstimateResult = await calculateEstimate(estimateData, user);
  console.log("calculateEstimateResult");
  console.log(calculateEstimateResult);

  const fixedFenceData = {
    client: fenceData.creator,
    fence: fenceData.fences,
    results: calculateEstimateResult.results,
    works: calculateEstimateResult.works,
    gates: null,
    totalPrice: calculateEstimateResult.totalPrice,
    totalCost: calculateEstimateResult.totalCost,
    totalProfit: calculateEstimateResult.totalProfit,
    totalMargin: calculateEstimateResult.totalMargin,
    priceVAT: calculateEstimateResult.priceVAT,
    priceWithDiscount: calculateEstimateResult.priceWithDiscount,
    discount: false,
    status: "Naujas Užsakymas",
    advance: 0,
    retail: false,
  };

  console.log("fixedFenceData");
  console.log(fixedFenceData);

  const result = await createProjectService(fixedFenceData, user);

  console.log("result");
  console.log(result);

  return { success: true, message: "Fence order received" };
}
