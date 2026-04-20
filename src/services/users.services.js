import APIClient from "@/api/apiClient.api";

class UsersServices extends APIClient {
  constructor() {
    super("users");
  }

  resetPassword(userId, payload) {
    return this.create(payload, {}, `${userId}/reset-password`);
  }
}

export default new UsersServices();