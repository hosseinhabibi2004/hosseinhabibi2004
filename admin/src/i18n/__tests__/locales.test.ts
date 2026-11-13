import { describe, expect, it } from "vitest";

import { defaultLanguage, getDir, languages } from "@/i18n/language";
import resources from "@/i18n/locales";

function keys(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, inner]) =>
      keys(inner, `${prefix}${key}.`),
    );
  }
  return [prefix.slice(0, -1)];
}

describe("the interface languages", () => {
  it("are English (default, left to right) and Persian (right to left)", () => {
    expect(languages).toEqual(["en", "fa"]);
    expect(defaultLanguage).toBe("en");
    expect(getDir("en")).toBe("ltr");
    expect(getDir("fa")).toBe("rtl");
  });

  it("define the same namespaces and the same keys in both", () => {
    expect(Object.keys(resources.fa).sort()).toEqual(Object.keys(resources.en).sort());
    for (const namespace of Object.keys(resources.en) as (keyof typeof resources.en)[]) {
      expect(keys(resources.fa[namespace]).sort(), namespace).toEqual(
        keys(resources.en[namespace]).sort(),
      );
    }
  });

  it("have no empty string", () => {
    for (const language of languages) {
      for (const [namespace, messages] of Object.entries(resources[language])) {
        for (const key of keys(messages)) {
          const value = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], messages);
          expect(String(value).trim(), `${language}.${namespace}.${key}`).not.toBe("");
        }
      }
    }
  });
});
