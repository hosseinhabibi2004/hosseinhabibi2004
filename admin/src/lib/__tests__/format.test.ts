import { describe, expect, it } from "vitest";

import { isolateText, toPersianDigits } from "@/lib/format";

describe("toPersianDigits", () => {
  it("rewrites Latin digits and leaves separators alone", () => {
    expect(toPersianDigits("2026-11-13")).toBe("۲۰۲۶-۱۱-۱۳");
  });

  it("accepts a number and leaves a string with no digits untouched", () => {
    expect(toPersianDigits(45)).toBe("۴۵");
    expect(toPersianDigits("abc")).toBe("abc");
  });
});

describe("isolateText", () => {
  it("wraps text in a first-strong isolate so a Latin run cannot reorder a Persian sentence", () => {
    expect(isolateText("my-post")).toBe("⁨my-post⁩");
  });
});
