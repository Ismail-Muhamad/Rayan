import APIClient from "@/api/apiClient.api";

class FertilizerTypesServices extends APIClient {
  constructor() {
    super("fertilizer-types");
  }
}

export default new FertilizerTypesServices();