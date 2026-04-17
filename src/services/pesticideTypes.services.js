import APIClient from "@/api/apiClient.api";

class PesticideTypesServices extends APIClient {
  constructor() {
    super("pesticide-types");
  }
}

export default new PesticideTypesServices();