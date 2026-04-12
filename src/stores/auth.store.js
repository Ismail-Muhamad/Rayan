import { defineStore } from "pinia";
import AuthServices from "@/services/auth.services";
import { toast } from "vue-sonner";
import CookieService from "@/services/cookies.services";
import i18n from "@/plugins/i18n";
import router from "@/router";

export const useAuthStore = defineStore("auth", {
  state: () => {
    return {
      userData: null,
      isAuthenticated: false,
      errorMessage: null,
      refreshTimeoutId: null,
      uiFlags: {
        isLoading: false,
        isCreating: false,
        isSubmitting: false,
        isFetching: false,
      },
    };
  },

  actions: {
    /**
     * Initializes the authentication store by restoring the session from cookies,
     * validating tokens, and scheduling token refresh if applicable.
     */
    async initializeAuthStore() {
      try {
        const accessToken = CookieService.get("accessToken");
        const refreshToken = CookieService.get("refreshToken");

        // If either token is missing, reset the store and exit
        if (!accessToken || !refreshToken) {
          this.clearAuthInfo();
          return;
        }

        const isExpired = this.isTokenExpired();

        if (isExpired) {
          // Attempt to refresh the token if expired
          await this.refreshToken();
        } else {
          // If token is valid, restore session and schedule refresh
          await this.restoreSession(accessToken);
        }
      } catch (error) {
        // Clear auth info and redirect to login on unrecoverable error
        this.clearAuthInfo();
        router.push({ name: "login" });
      }
    },

    /**
     * Restores the authenticated session when the access token is still valid.
     * @param {string} accessToken - The current access token.
     */
    async restoreSession(accessToken) {
      try {
        const refreshTime = this.getRefreshTime();

        // Fetch user profile to confirm token validity and populate store
        await this.getProfile();

        // Schedule token refresh
        this.scheduleTokenRefresh(refreshTime);
      } catch (error) {
        // If profile fetch fails (e.g., token is invalid), try to refresh
        try {
          await this.refreshToken();
        } catch {
          this.clearAuthInfo();
          router.push({ name: "login" });
        }
      }
    },

    /**
     * Logs in the user with the provided credentials.
     * @param {object} credentials - The user's login credentials.
     */
    async login(credentials) {
      this.uiFlags.isSubmitting = true;
      try {
        const response = await AuthServices.login(credentials);

        const {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn,
          user,
        } = response.data;
        console.log("login [response]", response);
        this.setAuthInfo({
          accessToken,
          refreshToken,
          expiresIn,
          user,
        });

        toast.success(i18n.global.t("GLOBAL.MESSAGES.LOGIN.SUCCESS"));
      } catch (error) {
        throw error;
      } finally {
        this.uiFlags.isSubmitting = false;
      }
    },

    /**
     * Registers a new user with the provided credentials.
     * @param {object} credentials - The user's registration data.
     */
    async register(credentials) {
      this.uiFlags.isCreating = true;
      try {
        const response = await AuthServices.register(credentials);
        if (response.status === 201) {
          toast.success(i18n.global.t("auth.register.messages.success"));
        }
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.uiFlags.isCreating = false;
      }
    },

    /**
     * Logs out the user, clears auth info, and redirects to login.
     */
    async logout() {
      this.uiFlags.isLoading = true;
      const token = CookieService.get("accessToken");
      try {
        if (token) {
          await AuthServices.logout(token);
        }
      } catch (error) {
        // Still clear local auth info even if the backend request fails
      } finally {
        this.clearAuthInfo();
        this.uiFlags.isLoading = false;
        router.push({ name: "login" });
      }
    },

    /**
     * Fetches the authenticated user's profile.
     */
    async getProfile() {
      this.uiFlags.isFetching = true;
      try {
        const response = await AuthServices.getAuthUser();
        this.userData = response.data || response;
        this.isAuthenticated = true;
        return this.userData;
      } catch (error) {
        throw error;
      } finally {
        this.uiFlags.isFetching = false;
      }
    },

    /**
     * Refreshes the access token using the refresh token stored in cookies.
     * After a successful refresh, schedules the next token refresh automatically.
     */
    async refreshToken() {
      this.uiFlags.isFetching = true;
      try {
        const refresh = CookieService.get("refreshToken");

        if (!refresh) {
          throw new Error("No refresh token available");
        }

        const response = await AuthServices.refreshAccessToken(refresh);

        const {
          access_token: accessToken,
          refresh_token: newRefreshToken,
          expires_in: expiresIn,
          user,
        } = response.data;

        // Guard: ensure we actually received a new access token
        if (!accessToken) {
          throw new Error("No access token returned from refresh endpoint");
        }

        this.setAuthInfo({
          accessToken,
          // If the server doesn't return a new refresh token, keep the existing one
          refreshToken: newRefreshToken || refresh,
          expiresIn: expiresIn || 3600,
          // If the server doesn't return user in refresh response, keep existing userData
          user: user || this.userData,
        });

        // If user data was not included in the refresh response, fetch profile separately
        if (!user && !this.userData) {
          await this.getProfile();
        }
      } catch (error) {
        this.clearAuthInfo();
        router.push({ name: "login" });
        throw error;
      } finally {
        this.uiFlags.isFetching = false;
      }
    },

    /**
     * Schedules a token refresh at the given time (in milliseconds from now).
     * Clears any existing scheduled refresh before setting a new one.
     * @param {number} refreshTime - Milliseconds until the token should be refreshed.
     */
    scheduleTokenRefresh(refreshTime) {
      // Clear any existing timeout
      if (this.refreshTimeoutId) {
        clearTimeout(this.refreshTimeoutId);
        this.refreshTimeoutId = null;
      }

      const scheduleIn = refreshTime > 0 ? refreshTime : 0;

      if (scheduleIn <= 0) {
        // Immediate refresh if time is already up
        this.refreshToken();
      } else {
        this.refreshTimeoutId = setTimeout(async () => {
          await this.refreshToken();
        }, scheduleIn);
      }
    },

    /**
     * Stores auth tokens in cookies and schedules the next token refresh.
     * @param {object} data - Auth data containing accessToken, refreshToken, expiresIn, user.
     */
    setAuthInfo(data) {
      // Clear existing schedule when setting new tokens
      if (this.refreshTimeoutId) {
        clearTimeout(this.refreshTimeoutId);
        this.refreshTimeoutId = null;
      }

      this.userData = data.user;
      this.isAuthenticated = true;

      // 🧪 TESTING: force expiry to 1 minute (change back to real value after testing)
      // const expiresInSec = data.expiresIn || 3600;
      // const expiresInSec = 60; // 1 minute for testing
      // const expiresInMs = expiresInSec * 1000;
      // const expiresAtMs = Date.now() + expiresInMs;
      // Calculate expiration time (fallback to 1 hour if not provided)
      const expiresInSec = data.expiresIn || 3600;
      const expiresInMs = expiresInSec * 1000;
      const expiresAtMs = Date.now() + expiresInMs;

      const accessTokenExpiryDate = new Date(expiresAtMs);
      const refreshTokenExpiryDate = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ); // 7 days

      // Persist tokens in cookies
      CookieService.set("accessToken", data.accessToken, {
        expires: accessTokenExpiryDate,
      });
      CookieService.set("refreshToken", data.refreshToken, {
        expires: refreshTokenExpiryDate,
      });
      CookieService.set("accessTokenExpiresAt", expiresAtMs.toString(), {
        expires: refreshTokenExpiryDate,
      });

      // 🧪 TESTING: refresh 10 seconds before expiry (change back to 60 * 1000 after testing)
      // const refreshTime = expiresInMs - 10 * 1000;
      // this.scheduleTokenRefresh(refreshTime);
      // Schedule refresh 1 minute before expiration
      const refreshTime = expiresInMs - 60 * 1000;
      this.scheduleTokenRefresh(refreshTime);
    },

    /**
     * Clears all authentication data from the store and cookies.
     * Also cancels any pending token refresh timeout.
     */
    clearAuthInfo() {
      if (this.refreshTimeoutId) {
        clearTimeout(this.refreshTimeoutId);
        this.refreshTimeoutId = null;
      }
      this.$reset();
      CookieService.remove("accessToken");
      CookieService.remove("refreshToken");
      CookieService.remove("accessTokenExpiresAt");
    },

    /**
     * Calculates how many milliseconds remain until the token should be refreshed.
     * Returns 0 if the refresh time has already passed or the cookie is missing.
     * @returns {number} Milliseconds until refresh should occur.
     */
    getRefreshTime() {
      const expiresAtStr = CookieService.get("accessTokenExpiresAt");
      if (!expiresAtStr) return 0;

      const expiresAt = parseInt(expiresAtStr, 10);
      if (isNaN(expiresAt)) return 0;

      const expiresInMs = expiresAt - Date.now();
      const refreshTime = expiresInMs - 60 * 1000; // Refresh 1 minute before expiration

      return refreshTime > 0 ? refreshTime : 0;
    },

    /**
     * Checks whether the current access token is expired.
     * @returns {boolean} True if expired or missing, false if still valid.
     */
    isTokenExpired() {
      const expiresAtStr = CookieService.get("accessTokenExpiresAt");
      if (!expiresAtStr) return true;

      const expiresAt = parseInt(expiresAtStr, 10);
      if (isNaN(expiresAt)) return true;

      return Date.now() >= expiresAt;
    },
  },
});
