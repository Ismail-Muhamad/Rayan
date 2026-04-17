import APIClient from "@/api/apiClient.api";

class FertilizerTypesServices extends APIClient {
  constructor() {
    super("fertilizer-types");
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

export default new FertilizerTypesServices();