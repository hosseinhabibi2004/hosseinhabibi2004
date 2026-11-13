export const languages = ["en", "fa"] as const;
export type Language = (typeof languages)[number];

/** The interface language of a first visit: English, left to right. */
export const defaultLanguage: Language = "en";

export const LANGUAGE_COOKIE = "app-lang";

export function isLanguage(value: string | undefined): value is Language {
  return value !== undefined && (languages as readonly string[]).includes(value);
}

export function getDir(language: string): "rtl" | "ltr" {
  return language === "fa" ? "rtl" : "ltr";
}

/**
 * Switches the interface language on the page: remembers it in the cookie (a year)
 * and sets `lang` and `dir` on `<html>`. The server reads the cookie on its next render.
 */
export function applyLanguage(language: Language): void {
  document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = language;
  document.documentElement.dir = getDir(language);
}
