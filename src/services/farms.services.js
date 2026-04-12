import APIClient from "@/api/apiClient.api";
class FarmsServices extends APIClient {
  constructor() {
    super("farms");
  }
}

export default new FarmsServices();
