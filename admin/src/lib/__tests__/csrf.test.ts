import { describe, expect, it } from "vitest";

import { applyCsrfHeader } from "@/lib/csrf";

describe("applyCsrfHeader", () => {
  it("adds the token to an unsafe request", () => {
    const headers = new Headers();
    applyCsrfHeader("POST", headers, "abc");
    expect(headers.get("X-CSRFToken")).toBe("abc");
  });

  it("leaves a safe request alone", () => {
    const headers = new Headers();
    applyCsrfHeader("GET", headers, "abc");
    expect(headers.has("X-CSRFToken")).toBe(false);
  });

  it("does nothing without a token", () => {
    const headers = new Headers();
    applyCsrfHeader("POST", headers, null);
    expect(headers.has("X-CSRFToken")).toBe(false);
  });
});
