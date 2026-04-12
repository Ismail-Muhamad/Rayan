import Cookies from "js-cookie";

class CookieService {
  // Default options without httpOnly since it’s not client-side controllable
  static defaultOptions = {
    secure: true, // Only sent over HTTPS
    sameSite: "strict", // Mitigate CSRF
  };

  get(key) {
    if (typeof key !== "string" || key.trim() === "") {
      throw new Error("Cookie key must be a non-empty string");
    }
    return Cookies.get(key);
  }

  set(key, value, options = {}) {
    if (typeof key !== "string" || key.trim() === "") {
      throw new Error("Cookie key must be a non-empty string");
    }
    if (value === undefined || value === null) {
      throw new Error("Cookie value cannot be undefined or null");
    }

    // Merge defaults first, then custom options to allow overrides
    const cookiesOptions = {
      ...CookieService.defaultOptions,
      ...options,
    };

    // Warn if httpOnly is attempted (optional, for debugging)
    if (cookiesOptions.httpOnly) {
      delete cookiesOptions.httpOnly; // Remove it since it’s ineffective
    }

    Cookies.set(key, value, cookiesOptions);
  }

  remove(key, options = {}) {
    if (typeof key !== "string" || key.trim() === "") {
      throw new Error("Cookie key must be a non-empty string");
    }

    // Use same defaults as set, allow overrides for consistency
    const cookiesOptions = {
      ...CookieService.defaultOptions,
      ...options,
    };

    // Remove httpOnly if present (it’s ignored by js-cookie anyway)
    delete cookiesOptions.httpOnly;

    Cookies.remove(key, cookiesOptions);
  }
}

export default new CookieService();
