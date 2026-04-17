import APIClient from "@/api/apiClient.api";

class PesticideTypesServices extends APIClient {
  constructor() {
    super("pesticide-types");
  }

  getAll(params = {}) {
    return this.get("", { params });
  }

  createType(payload) {
    return this.post("", payload);
  }

  updateType(id, payload) {
    return this.put(`/${id}`, payload);
  }
}

export default new PesticideTypesServices();