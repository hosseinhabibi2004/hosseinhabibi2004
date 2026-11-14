export type Locale = "en" | "fa";

const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  // The Persian site shows Persian-calendar dates and digits.
  fa: "fa-IR",
};

/** Formats an ISO date or datetime for the locale; "short" gives "Apr 2022" style output. */
export function formatDate(iso: string, lng: Locale, style: "long" | "short" = "long"): string {
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
      : { year: "numeric", month: "short", timeZone: "UTC" };
  return new Intl.DateTimeFormat(INTL_LOCALE[lng], options).format(new Date(iso));
}

/** Zero-padded ordinal in the locale's digits: 1 -> "01" (en) / "۰۱" (fa). */
export function formatOrdinal(n: number, lng: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[lng], {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(n);
}
