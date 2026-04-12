import APIClient from "@/api/apiClient.api";
class RequestsServices extends APIClient {
  constructor() {
    super("requests");
  }
}

export default new RequestsServices();
