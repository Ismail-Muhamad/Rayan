import APIClient from "@/api/apiClient.api";
class MonthlyInspectionsServices extends APIClient {
  constructor() {
    super("monthly-inspections");
  }
}

export default new MonthlyInspectionsServices();
