import response from "../modules/response";
import { generateProductionReport } from "../services/reportServices";

export default {
  getProductionReport: async (req: any, res: any) => {
    try {
      const responseData = await generateProductionReport(req.body);
      return response(res, true, responseData, "");
    } catch (error) {
      console.error("Klaida:", error);

      return response(res, false, null, "Serverio klaida");
    }
  },
};
