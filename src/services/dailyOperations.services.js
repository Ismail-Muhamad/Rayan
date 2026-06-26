import APIClient from "@/api/apiClient.api";

class DailyOperationsServices extends APIClient {
  constructor() {
    super("daily-operations");
  }

  // Override or add custom methods if needed since we are not using the full resource
  getOperation(params) {
    return this.get(params);
  }

  saveOperation(data) {
    return this.create(data);
  }
}

export default new DailyOperationsServices();
