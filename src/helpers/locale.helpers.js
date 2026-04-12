import i18n from "@/plugins/i18n";

export default {
  initializeLocale() {
    const locale = localStorage.getItem("locale") || "ar";
    this.setLocale(locale);
  },
  setLocale(locale) {
    i18n.global.locale = locale;
    localStorage.setItem("locale", locale);
    const dirValue = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", dirValue);
    document.body.setAttribute("dir", dirValue);
  },
  getLocale() {
    return i18n.global.locale;
  },
};
