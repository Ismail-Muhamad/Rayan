// i want to refacor it

import axios from "axios";
import CookieService from "../services/cookies.services";
// import { useAuthStore } from "@/stores/Authentication/authentication";
// import router from "@/router";
import serverErrorHandler from "@/helpers/serverErrorHandler";
import { toast } from "vue-sonner";
import i18n from "@/plugins/i18n";
import router from "@/router";
// Define base URL and API key from environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Define a list of endpoints that do not require authentication
const nonAuthEndpoints = ["/auth", "/register", "/login", "/refresh"];

// Create a custom Axios instance with specific configurations
const axiosDefaultConfig = {
  baseURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    Prefer: "count=exact",
    // Add any other headers as needed
  },
  // You can add more configurations here as needed
};

const axiosClient = axios.create(axiosDefaultConfig);

// Add Auth Headers to requests if logged in
axiosClient.interceptors.request.use(
  async (config) => {
    // Dynamically import to avoid circular dependency
    const { useAuthStore } = await import("@/stores/auth.store");
    const { default: router } = await import("@/router");

    const authStore = useAuthStore();
    const accessToken = CookieService.get("accessToken");
    const refreshToken = CookieService.get("refreshToken");

    // Check if the request URL is in the list of non-auth endpoints
    const isNonAuthEndpoint = nonAuthEndpoints.some((endpoint) =>
      config.url.includes(endpoint),
    );
    const isRefreshEndpoint = config.url.includes("/refresh");

    if (!isNonAuthEndpoint && !accessToken) {
      // If the request is not in the list of non-auth endpoints and the user is not authenticated
      // Cancel the request if the user is not authenticated and the endpoint requires auth and log the user out
      authStore.clearAuthInfo();
      router.push({ name: "login" });
      const error = new axios.Cancel(
        "User not authenticated or not authorized",
      );
      // Reject the promise with the error
      return Promise.reject(error);
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      // Add user ID to requests if user is logged in
      // if (authStore.userData?.id) {
      //   if (config.data instanceof FormData) {
      //     config.data.append("user_id", authStore.userData.id);
      //   } else if (config.data) {
      //     config.data.user_id = authStore.userData.id;
      //   } else {
      //     config.data = { user_id: authStore.userData.id };
      //   }
      // }
    }
    if (isRefreshEndpoint && refreshToken) {
      config.headers.Authorization = `Bearer ${refreshToken}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    // Proceed with the request
    return config;
  },
  (error) =>
    // Do something with request error
    Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) =>
    // Process response data before returning
    response,
  (error) => {
    const errorMessage = serverErrorHandler(error);
    // if user not activated and try to access login page
    if (
      error.response.status === 403 &&
      router.currentRoute.value.name === "login"
    ) {
      toast.warning(i18n.global.t("auth.login.messages.pending"));
    } else {
      toast.error(errorMessage);
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
