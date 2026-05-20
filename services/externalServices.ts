import { calculateEstimate } from "./calculationsServices";
import { createProjectService } from "./projectService";
import { getUserById } from "./userServices";

export async function orderFence(body: any) {
  const { orderData, fenceData } = body;

  const user = await getUserById(orderData.to._id);

  const estimateData = {
    calculations: {
      fences: fenceData.fences,
      retail: false,
      units: false,
    },
  };
  const calculateEstimateResult = await calculateEstimate(estimateData);

  const fixedFenceData = {
    client: fenceData.creator,
    fenceMeasures: fenceData.fences,
    results: calculateEstimateResult.results,
    works: calculateEstimateResult.works,
    gates: {},
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
  console.log(estimateData);

  const result = await createProjectService(fixedFenceData, user);

  return { success: true, message: "Fence order received" };
}
