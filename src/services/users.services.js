import APIClient from "@/api/apiClient.api";
class UsersServices extends APIClient {
  constructor() {
    super("users");
  }
}

export default new UsersServices();
