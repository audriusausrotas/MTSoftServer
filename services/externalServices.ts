import { createProjectService } from "./projectService";
import { getUserById } from "./userServices";

export async function orderFence(body: any) {
  const { orderData, fenceData } = body;

  const user = await getUserById(orderData.to._id);

  const fixedFenceData = {
    client: fenceData.creator,
    fence: fenceData.fences,
    results: null,
    works: null,
    gates: null,
    totalPrice: null,
    totalCost: null,
    totalProfit: null,
    totalMargin: null,
    priceVAT: null,
    priceWithDiscount: null,
    discount: null,
    status: "Naujas Užsakymas",
    advance: 0,
    retail: false,
  };

  const result = await createProjectService(fixedFenceData, user);

  return { success: true, message: "Fence order received" };
}
