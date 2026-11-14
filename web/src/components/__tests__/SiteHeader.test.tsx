// Contract (plan B4)
// - `@/components/SiteHeader` exports the ASYNC SERVER component
//     SiteHeader({ lng, twinPaths }): Promise<ReactElement>      (twinPaths: Record<string, string | null>)
//   awaited by the tests; it translates with getT (initServerI18next is called here, as the layout does).
//   It holds the nav (Home/About/Posts/Projects/Contact), a Resume link to /{lng}/about/, a skip
//   link to #main, the ThemeToggle and the LocaleSwitch.
// - `@/components/LocaleSwitch` exports the client component
//     LocaleSwitch({ lng, twinPaths })   — reads usePathname() (without the base path) and links
//   to the twin path; with a null twin to the other locale's list page; on an unknown path to /{other}/.
// - `@/components/SiteFooter` exports the ASYNC SERVER component
//     SiteFooter({ lng, profile: PublicProfile | null })
//   with the profile links and an illustration attribution line.
// Links are asserted on the href suffix: next/link prepends NEXT_PUBLIC_BASE_PATH.
import path from "node:path";

import { render, screen, within } from "@testing-library/react";
import { initServerI18next } from "next-i18next/server";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleSwitch } from "@/components/LocaleSwitch";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { i18nConfig } from "@/i18n/config";
import { renderWithI18n } from "@/i18n/test-utils";

let pathname = "/en/";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const FIXTURES = path.resolve(import.meta.dirname, "../../lib/content/__fixtures__");

beforeAll(() => {
  initServerI18next(i18nConfig);
});
beforeEach(() => {
  pathname = "/en/";
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function hrefs(): string[] {
  return screen.getAllByRole("link").map((a) => a.getAttribute("href") ?? "");
}
function linkTo(suffix: string) {
  return screen.getAllByRole("link").find((a) => (a.getAttribute("href") ?? "").endsWith(suffix));
}

describe("LocaleSwitch", () => {
  const twins = {
    "/en/": "/fa/",
    "/en/posts/": "/fa/posts/",
    "/en/posts/x/": "/fa/posts/x/",
    "/en/posts/only-en/": null,
    "/en/projects/only-en/": null,
  };

  it("links to the twin of the current page", () => {
    pathname = "/en/posts/x/";
    renderWithI18n(<LocaleSwitch lng="en" twinPaths={twins} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", expect.stringMatching(/\/fa\/posts\/x\/$/));
  });

  it("falls back to the list page when the post has no twin", () => {
    pathname = "/en/posts/only-en/";
    renderWithI18n(<LocaleSwitch lng="en" twinPaths={twins} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", expect.stringMatching(/\/fa\/posts\/$/));
  });

  it("falls back to the projects list for a project without a twin", () => {
    pathname = "/en/projects/only-en/";
    renderWithI18n(<LocaleSwitch lng="en" twinPaths={twins} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", expect.stringMatching(/\/fa\/projects\/$/));
  });

  it("falls back to the other locale's home on an unknown path", () => {
    pathname = "/en/something/unknown/";
    renderWithI18n(<LocaleSwitch lng="en" twinPaths={twins} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", expect.stringMatching(/\/fa\/$/));
  });

  it("switches from fa to en", () => {
    pathname = "/fa/posts/x/";
    renderWithI18n(
      <LocaleSwitch lng="fa" twinPaths={{ "/fa/posts/x/": "/en/posts/x/" }} />,
      "fa",
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", expect.stringMatching(/\/en\/posts\/x\/$/));
  });
});

describe("SiteHeader", () => {
  const twinPaths = { "/en/": "/fa/", "/en/posts/x/": "/fa/posts/x/" };

  it("renders the English nav with trailing-slash paths, Resume and the skip link", async () => {
    pathname = "/en/posts/x/";
    renderWithI18n(await SiteHeader({ lng: "en", twinPaths }));

    const expected: Array<[string, string]> = [
      ["Home", "/en/"],
      ["About", "/en/about/"],
      ["Posts", "/en/posts/"],
      ["Projects", "/en/projects/"],
      ["Contact", "/en/contact/"],
    ];
    for (const [name, href] of expected) {
      const matches = screen.getAllByRole("link", { name });
      expect(
        matches.some((a) => a.getAttribute("href")?.endsWith(href)),
        `${name} -> ${href}`,
      ).toBe(true);
    }
    const resume = screen.getAllByRole("link", { name: "Resume" });
    expect(resume.some((a) => a.getAttribute("href")?.endsWith("/en/about/"))).toBe(true);

    const skip = screen.getAllByRole("link").find((a) => a.getAttribute("href") === "#main");
    expect(skip).toBeDefined();
    expect(linkTo("/fa/posts/x/")).toBeDefined();
  });

  it("renders Persian labels for fa", async () => {
    pathname = "/fa/";
    renderWithI18n(await SiteHeader({ lng: "fa", twinPaths: { "/fa/": "/en/" } }), "fa");

    const labelOf = (href: string) =>
      screen
        .getAllByRole("link")
        .filter((a) => a.getAttribute("href")?.endsWith(href))
        .map((a) => a.textContent ?? "");

    expect(labelOf("/fa/").some((t) => t.includes("خانه"))).toBe(true);
    expect(labelOf("/fa/about/").some((t) => t.includes("درباره"))).toBe(true);
    expect(labelOf("/fa/about/").some((t) => t.includes("رزومه"))).toBe(true);
    expect(labelOf("/fa/posts/").some((t) => /\p{Script=Arabic}/u.test(t))).toBe(true);
    expect(labelOf("/fa/projects/").some((t) => t.includes("پروژه"))).toBe(true);
    expect(labelOf("/fa/contact/").some((t) => t.includes("تماس"))).toBe(true);
    expect(screen.queryByRole("link", { name: "Home" })).toBeNull();
  });

  it("has a theme toggle button", async () => {
    renderWithI18n(await SiteHeader({ lng: "en", twinPaths }));
    expect(screen.getAllByRole("button", { name: /\S/ }).length).toBeGreaterThan(0);
    expect(hrefs().length).toBeGreaterThan(5);
  });
});

describe("SiteFooter", () => {
  async function fixtureProfile(lng: string) {
    vi.resetModules();
    vi.stubEnv("CONTENT_DIR", FIXTURES);
    const { getProfile } = await import("@/lib/content");
    return getProfile(lng);
  }

  it("lists the profile links and the illustration attribution", async () => {
    const profile = await fixtureProfile("en");
    expect(profile).not.toBeNull();
    renderWithI18n(await SiteFooter({ lng: "en", profile }));

    const footer = screen.getByRole("contentinfo");
    const links = within(footer).getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).toContain("https://github.com/hosseinhabibi2004");
    expect(links).toContain("https://www.linkedin.com/in/hosseinhabibi");
    expect(footer.textContent).toMatch(/illustration/i);
  });

  it("renders without a profile", async () => {
    renderWithI18n(await SiteFooter({ lng: "en", profile: null }));
    const footer = screen.getByRole("contentinfo");
    expect(footer.textContent).toMatch(/illustration/i);
  });

  it("renders in Persian", async () => {
    const profile = await fixtureProfile("fa");
    render(await SiteFooter({ lng: "fa", profile }));
    expect(screen.getByRole("contentinfo").textContent).toMatch(/\p{Script=Arabic}/u);
  });
});
