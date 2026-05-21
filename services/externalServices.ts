import { calculateEstimate } from "./calculationsServices";
import { createProjectService } from "./projectService";
import { getUserById } from "./userServices";

export async function orderFence(body: any) {
  const { data } = body;
  console.log(data);
  // const user = await getUserById(data.to._id);

  // const estimateData = {
  //   fences: data.data.fences,
  //   bindings: data.data.bindings,
  // };
  // const calculateEstimateResult = await calculateEstimate(estimateData);

  // const fixedData = {
  //   client: data.data.creator,
  //   fenceMeasures: data.data.fences,
  //   results: calculateEstimateResult.results,
  //   works: calculateEstimateResult.works,
  //   gates: {},
  //   totalPrice: calculateEstimateResult.totalPrice,
  //   totalCost: calculateEstimateResult.totalCost,
  //   totalProfit: calculateEstimateResult.totalProfit,
  //   totalMargin: calculateEstimateResult.totalMargin,
  //   priceVAT: calculateEstimateResult.priceVAT,
  //   priceWithDiscount: calculateEstimateResult.priceWithDiscount,
  //   discount: false,
  //   status: "Naujas Užsakymas",
  //   advance: 0,
  //   retail: false,
  // };
  // console.log(estimateData);

  // const result = await createProjectService(fixedData, user);

  // return { success: true, message: "Fence order received" };
}
