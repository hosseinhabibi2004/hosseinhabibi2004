import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { navItems } from "@/features/shell/nav";
import { ShellSidebar } from "@/features/shell/ShellSidebar";
import { applyLanguage, LANGUAGE_COOKIE } from "@/i18n/language";
import { renderWithProviders } from "@/i18n/test-utils";

let pathname = "/";
vi.mock("next/navigation", () => ({
  // next-i18next's provider reads the route params.
  useParams: () => ({}),
  usePathname: () => pathname,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  pathname = "/";
  document.cookie = `${LANGUAGE_COOKIE}=; max-age=0; path=/`;
  document.documentElement.removeAttribute("dir");
  document.documentElement.removeAttribute("lang");
});

describe("the navigation", () => {
  it("comes from one list: the dashboard and posts", () => {
    expect(navItems.map((item) => item.href)).toEqual(["/", "/posts"]);
  });

  it("marks the current page, matching nested paths for sections but not the dashboard", () => {
    pathname = "/posts/abc";
    renderWithProviders(<ShellSidebar />);

    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("marks only the dashboard on the home path", () => {
    renderWithProviders(<ShellSidebar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Posts" })).not.toHaveAttribute("aria-current");
  });
});

describe("switching the interface language", () => {
  it("stores the choice in the app-lang cookie and flips lang and dir", () => {
    applyLanguage("fa");

    expect(document.cookie).toContain(`${LANGUAGE_COOKIE}=fa`);
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("fa");

    applyLanguage("en");

    expect(document.cookie).toContain(`${LANGUAGE_COOKIE}=en`);
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
  });

  it("names the cookie app-lang", () => {
    expect(LANGUAGE_COOKIE).toBe("app-lang");
  });
});
