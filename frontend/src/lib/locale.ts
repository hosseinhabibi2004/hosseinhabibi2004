export const locales = ["en", "fa"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const rtlLocales: readonly Locale[] = ["fa"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDir(locale: string): "rtl" | "ltr" {
  return (rtlLocales as readonly string[]).includes(locale) ? "rtl" : "ltr";
}
