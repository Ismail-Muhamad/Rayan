import APIClient from "@/api/apiClient.api";
class ReportsServices extends APIClient {
  constructor() {
    super("reports");
  }
}

export default new ReportsServices();
