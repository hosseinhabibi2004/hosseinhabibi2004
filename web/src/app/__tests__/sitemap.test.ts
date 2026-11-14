// Contract (plan D2): the default export of `@/app/sitemap` returns (sync or async) a
// MetadataRoute.Sitemap with one entry per route of BOTH locales, each exactly once: home,
// about, posts, each post, projects, each project, tags (index), each used tag, contact.
// URLs are absolute, include NEXT_PUBLIC_BASE_PATH and end in "/". An entry whose page also
// exists in the other locale has alternates.languages with both locales; otherwise only its own.
// Posts carry lastModified from published_at. No 404 and no feed.xml.
import path from "node:path";

import { beforeAll, describe, expect, it, vi } from "vitest";

const FIXTURES = path.resolve(import.meta.dirname, "../../lib/content/__fixtures__");
const ORIGIN = "https://example.github.io";
const BASE = "/portfolio";
const url = (p: string) => `${ORIGIN}${BASE}${p}`;
const SHARED = "building-a-static-portfolio";
const EN_ONLY = "notes-on-drf-envelopes";

type Entry = {
  url: string;
  lastModified?: string | Date;
  alternates?: { languages?: Record<string, string> };
};
let entries: Entry[];

beforeAll(async () => {
  vi.stubEnv("CONTENT_DIR", FIXTURES);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", ORIGIN);
  vi.stubEnv("NEXT_PUBLIC_BASE_PATH", BASE);
  vi.stubEnv("BACKEND_API_URL", "http://localhost:8000");
  const mod = await import("@/app/sitemap");
  entries = (await mod.default()) as Entry[];
});

const EN_ROUTES = [
  "/en/",
  "/en/about/",
  "/en/posts/",
  `/en/posts/${EN_ONLY}/`,
  `/en/posts/${SHARED}/`,
  "/en/projects/",
  "/en/projects/habibi-portfolio/",
  "/en/projects/invoice-api/",
  "/en/tags/",
  "/en/tags/django/",
  "/en/tags/nextjs/",
  "/en/contact/",
];
const FA_ROUTES = [
  "/fa/",
  "/fa/about/",
  "/fa/posts/",
  `/fa/posts/${SHARED}/`,
  "/fa/projects/",
  "/fa/tags/",
  "/fa/contact/",
];

function find(p: string): Entry {
  const entry = entries.find((e) => e.url === url(p));
  expect(entry, `missing ${p}`).toBeDefined();
  return entry!;
}

describe("sitemap", () => {
  it("lists every route of both locales exactly once, and nothing else", () => {
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect([...urls].sort()).toEqual([...EN_ROUTES, ...FA_ROUTES].map(url).sort());
  });

  it("uses absolute URLs with the base path and a trailing slash", () => {
    for (const e of entries) {
      expect(e.url.startsWith(`${ORIGIN}${BASE}/`)).toBe(true);
      expect(e.url.endsWith("/")).toBe(true);
    }
  });

  it("adds both locales as alternates for a post published in both", () => {
    expect(find(`/en/posts/${SHARED}/`).alternates?.languages).toEqual({
      en: url(`/en/posts/${SHARED}/`),
      fa: url(`/fa/posts/${SHARED}/`),
    });
    expect(find("/en/about/").alternates?.languages).toEqual({
      en: url("/en/about/"),
      fa: url("/fa/about/"),
    });
  });

  it("adds only its own locale for a post published in one locale", () => {
    const langs = find(`/en/posts/${EN_ONLY}/`).alternates?.languages;
    expect(Object.keys(langs ?? {})).toEqual(["en"]);
  });

  it("sets lastModified of posts from published_at", () => {
    const shared = find(`/en/posts/${SHARED}/`).lastModified;
    const enOnly = find(`/en/posts/${EN_ONLY}/`).lastModified;
    expect(new Date(shared as string).toISOString()).toBe("2026-03-10T09:00:00.000Z");
    expect(new Date(enOnly as string).toISOString()).toBe("2026-05-02T09:00:00.000Z");
  });

  it("excludes the 404 page and the feed", () => {
    for (const e of entries) {
      expect(e.url).not.toContain("404");
      expect(e.url).not.toContain("feed.xml");
    }
  });
});
