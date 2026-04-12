import APIClient from "@/api/apiClient.api";
import axiosClient from "@/api/axiosClient";
class AuthServices extends APIClient {
  constructor() {
    super();
  }
  login(data) {
    return axiosClient.post(`${this.url}/login`, data);
  }
  register(data) {
    console.log(data);
    return axiosClient.post(`${this.url}/register`, data);
  }
  logout() {
    return axiosClient.post(`${this.url}/logout`);
  }
  refreshAccessToken() {
    return axiosClient.post(`${this.url}/refresh`);
  }
  getAuthUser() {
    return axiosClient.get(`${this.url}/user`);
  }
}

export default new AuthServices();
