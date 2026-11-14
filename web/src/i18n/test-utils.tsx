import { render, type RenderResult } from "@testing-library/react";
import { createInstance } from "i18next";
import type { ReactElement } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";

import { i18nConfig } from "@/i18n/config";
import en from "@/i18n/locales/en";
import fa from "@/i18n/locales/fa";

/**
 * Renders `ui` with the translations the layout supplies, so `useT` works.
 *
 * Uses a plain i18next instance rather than the app's `I18nProvider`: that provider syncs the
 * language from `useParams()` in the browser, which tests that mock `next/navigation` do not define.
 */
export function renderWithI18n(ui: ReactElement, lng: "en" | "fa" = "en"): RenderResult {
  const i18n = createInstance();
  void i18n.use(initReactI18next).init({
    lng,
    fallbackLng: i18nConfig.fallbackLng as string,
    defaultNS: "common",
    ns: Object.keys(en),
    resources: { en, fa },
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}
