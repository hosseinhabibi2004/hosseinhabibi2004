/**
 * Number and text helpers for a bilingual interface: Persian digits and grouping in
 * Persian, plain Latin ones in English.
 */

/** Rewrite the Latin digits inside any string (`2026-11-13` → `۲۰۲۶-۱۱-۱۳`); separators survive. */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) + 0x06f0 - 0x30),
  );
}

/** Rewrite Persian and Arabic-Indic digits back to Latin, so values sent to the API stay Latin. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
}

/** Wrap text of unknown direction — a name typed in either script — in a first-strong isolate so it cannot reorder the sentence around it. */
export function isolateText(text: string): string {
  return `⁨${text}⁩`;
}

/** Wrap left-to-right text — a slug, a path — in left-to-right isolates for the same reason. */
export function isolateLtr(text: string): string {
  return `⁦${text}⁩`;
}

/** A digit string in the reader's language: Persian digits when the interface is Persian. */
export function localizeDigits(value: string | number, language: string): string {
  return language === "fa" ? toPersianDigits(value) : String(value);
}

/** A whole number with the language's own digits and grouping. */
export function formatNumber(value: number, language: string): string {
  return new Intl.NumberFormat(language === "fa" ? "fa-IR" : "en-US").format(value);
}
