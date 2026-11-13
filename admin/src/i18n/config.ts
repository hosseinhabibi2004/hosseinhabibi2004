import { defineConfig } from "next-i18next";

import { defaultLanguage, LANGUAGE_COOKIE, languages } from "./language";
import resources from "./locales";

// Cookie mode: no language in the URL. The admin runs on a server and reads the cookie.
export const i18nConfig = defineConfig({
  supportedLngs: [...languages],
  fallbackLng: defaultLanguage,
  defaultNS: "common",
  ns: Object.keys(resources.en),
  cookieName: LANGUAGE_COOKIE,
  localeInPath: false,
  resources,
});
