import { describe, expect, it } from "vitest";

import { EMPTY_SLUG, staticSlugParams } from "@/lib/static-params";

const data: Record<string, string[]> = { en: ["a", "b"], fa: [] };

describe("staticSlugParams", () => {
  it("returns the slugs of the locale", () => {
    expect(staticSlugParams("en", (l) => data[l] ?? [])).toEqual([{ slug: "a" }, { slug: "b" }]);
  });

  it("re-emits another locale's pairs for a locale without items", () => {
    expect(staticSlugParams("fa", (l) => data[l] ?? [])).toEqual([
      { lng: "en", slug: "a" },
      { lng: "en", slug: "b" },
    ]);
  });

  it("falls back to one inert entry when no locale has items", () => {
    expect(staticSlugParams("fa", () => [])).toEqual([{ lng: "en", slug: EMPTY_SLUG }]);
  });
});
