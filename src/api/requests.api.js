import APIClient from "./apiClient.api";

class RequestsAPI extends APIClient {
  constructor() {
    super("rest", "rpc/get_paginated_requests");
  }
}

export default new RequestsAPI();
