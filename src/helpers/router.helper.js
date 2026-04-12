// import { PERMISSIONS } from "@/constants/permissions";
import { useAuthStore } from "@/stores/auth.store";
import CookieService from "@/services/cookies.services";

const authGuard = async (to, from, next) => {
  const authStore = useAuthStore();
  // Check for actual token presence
  const accessToken = CookieService.get("accessToken");
  const refreshToken = CookieService.get("refreshToken");

  // If no tokens exist, immediately clear auth state and redirect to login
  if (!accessToken || !refreshToken) {
    authStore.clearAuthInfo();
    // Redirect only if the route requires authentication
    if (!to.meta.requiresUnAuth) {
      return next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    }
  }

  // Refresh token or perform initial authentication check if not authenticated
  // Only refresh if the user is not already authenticated
  if (!authStore.isAuthenticated || !authStore.userData) {
    try {
      await authStore.initializeAuthStore();
    } catch (error) {
      // If refresh fails, clear auth state and redirect to login
      authStore.clearAuthInfo();
      // Redirect only if the route requires authentication
      if (!to.meta.requiresUnAuth) {
        return next({
          name: "login",
          query: { redirect: to.fullPath },
        });
      }
    }
  }

  // After potential refresh, get the current authentication state
  const isAuthenticated = authStore.isAuthenticated;

  // If the user is authenticated and tries to access login or register routes, redirect to the previous route
  if (to.meta.requiresUnAuth && isAuthenticated) {
    const userRole = authStore.userData?.role;
    if (userRole === "farm_owner") {
      return next({ name: "farms" });
    }
    return next({ name: "dashboard_index" });
  }

  // Handle routes that require authentication
  if (!to.meta.requiresUnAuth && !isAuthenticated) {
    // If the route requires authentication, and the user is not authenticated, redirect to login
    return next({ name: "login", query: { redirect: to.fullPath } });
  }

  // Handle role-based access checks
  if (to.matched.some((record) => record.meta.roles)) {
    // Get the required roles from the matched route segment
    const routeRoles = to.matched.find((record) => record.meta.roles).meta
      .roles;
    const userRole = authStore.userData?.role;

    // If user role is not in the allowed roles array for this route
    if (userRole && !routeRoles.includes(userRole)) {
      // Redirect to their default workspace instead
      if (userRole === "farm_owner") {
        return next({ name: "farms" });
      }
      return next({ name: "dashboard_index" });
    }
  }

  // Default behavior: proceed to the route
  next();
};

export { authGuard };
