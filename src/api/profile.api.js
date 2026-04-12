import APIClient from "./apiClient.api";

class ProfileAPI extends APIClient {
  constructor() {
    super("rest", "users");
  }
}

export default new ProfileAPI();
