import { describe, expect, it } from "vitest";

import en from "@/i18n/locales/en";
import fa from "@/i18n/locales/fa";

function keys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? keys(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe("locale files", () => {
  it("define the same keys in every language", () => {
    expect(keys(fa).sort()).toEqual(keys(en).sort());
  });
});
