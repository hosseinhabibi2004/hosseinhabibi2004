import { defineConfig } from "next-i18next";

import { defaultLocale, locales } from "@/lib/locale";

import en from "./locales/en";
import fa from "./locales/fa";

// The locale is part of the path (/en/, /fa/): a static export has no cookies,
// headers or proxy to decide it per request.
export const i18nConfig = defineConfig({
  supportedLngs: [...locales],
  fallbackLng: defaultLocale,
  defaultNS: "common",
  ns: Object.keys(en),
  localeInPath: true,
  resources: { en, fa },
});
