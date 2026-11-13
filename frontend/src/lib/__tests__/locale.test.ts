import { describe, expect, it } from "vitest";

import { defaultLocale, getDir, isLocale, locales } from "@/lib/locale";

describe("locales", () => {
  it("has the default locale among the supported ones", () => {
    expect(locales).toContain(defaultLocale);
  });

  it("recognises supported locales only", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fa")).toBe(true);
    expect(isLocale("de")).toBe(false);
  });
});

describe("getDir", () => {
  it("is right-to-left for Persian and left-to-right otherwise", () => {
    expect(getDir("fa")).toBe("rtl");
    expect(getDir("en")).toBe("ltr");
  });
});
