import { createI18n } from "vue-i18n";
import en from "@/locale/en";
import ar from "@/locale/ar";
const messages = {
  en,
  ar,
};
const i18n = createI18n({
  legacy: false,
  locale: "ar",
  fallbackLocale: "ar",
  globalInjection: true,
  inheritLocale: true,
  allowComposition: true,
  messages,
  datetimeFormats: {
    en: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      },
    },
    ar: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      },
    },
  },
});

export default i18n;
