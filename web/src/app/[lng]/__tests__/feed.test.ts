// Contract (plan D3): `@/app/[lng]/feed.xml/route` is a static route handler:
//   export const dynamic = "force-static"
//   export function generateStaticParams() -> [{ lng: "en" }, { lng: "fa" }]
//   export async function GET(request: Request, { params }: { params: Promise<{ lng }> }): Promise<Response>
// The response has content-type application/rss+xml (or application/xml) and a well-formed
// RSS 2.0 body: <rss version="2.0"><channel> with title, link (absolute home of the locale),
// language (en | fa), and one <item> per post of that locale, newest first, each with title,
// absolute link, guid, pubDate (RFC 822, e.g. "Tue, 10 Mar 2026 09:00:00 GMT") and description
// (the summary). Text is XML-escaped.
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { beforeAll, describe, expect, it, vi } from "vitest";

const FIXTURES = path.resolve(import.meta.dirname, "../../../lib/content/__fixtures__");
const ORIGIN = "https://example.github.io";
const BASE = "/portfolio";
const SHARED = "building-a-static-portfolio";
const EN_ONLY = "notes-on-drf-envelopes";

type Route = typeof import("@/app/[lng]/feed.xml/route");
let route: Route;

beforeAll(async () => {
  vi.stubEnv("CONTENT_DIR", FIXTURES);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", ORIGIN);
  vi.stubEnv("NEXT_PUBLIC_BASE_PATH", BASE);
  vi.stubEnv("BACKEND_API_URL", "http://localhost:8000");
  route = await import("@/app/[lng]/feed.xml/route");
});

async function fetchFeed(lng: string) {
  const response = await route.GET(new Request(`${ORIGIN}${BASE}/${lng}/feed.xml`), {
    params: Promise.resolve({ lng }),
  });
  const text = await response.text();
  const doc = new DOMParser().parseFromString(text, "application/xml");
  return { response, text, doc };
}

const textOf = (el: Element, tag: string) => el.querySelector(`:scope > ${tag}`)?.textContent ?? null;

describe("feed route config", () => {
  it("is force-static and enumerates both locales", async () => {
    expect(route.dynamic).toBe("force-static");
    expect(await route.generateStaticParams()).toEqual([{ lng: "en" }, { lng: "fa" }]);
  });
});

describe("en feed", () => {
  it("is RSS 2.0 XML with channel metadata", async () => {
    const { response, doc } = await fetchFeed("en");
    expect(response.headers.get("content-type")).toMatch(/^application\/(rss\+)?xml/);
    expect(doc.querySelector("parsererror")).toBeNull();
    expect(doc.documentElement.tagName).toBe("rss");
    expect(doc.documentElement.getAttribute("version")).toBe("2.0");
    const channel = doc.querySelector("rss > channel")!;
    expect(textOf(channel, "title")).toBeTruthy();
    expect(textOf(channel, "link")).toBe(`${ORIGIN}${BASE}/en/`);
    expect(textOf(channel, "language")).toBe("en");
  });

  it("has one item per post, newest first, with absolute links and RFC 822 dates", async () => {
    const { doc } = await fetchFeed("en");
    const items = [...doc.querySelectorAll("channel > item")];
    expect(items).toHaveLength(2);
    expect(items.map((i) => textOf(i, "link"))).toEqual([
      `${ORIGIN}${BASE}/en/posts/${EN_ONLY}/`,
      `${ORIGIN}${BASE}/en/posts/${SHARED}/`,
    ]);
    expect(textOf(items[1], "title")).toBe("Building a static portfolio");
    expect(textOf(items[1], "description")).toBe("Why I moved my portfolio to a static export.");
    expect(textOf(items[1], "pubDate")).toBe("Tue, 10 Mar 2026 09:00:00 GMT");
    expect(textOf(items[0], "pubDate")).toBe(new Date("2026-05-02T09:00:00Z").toUTCString());
    for (const item of items) {
      expect(textOf(item, "guid")).toBeTruthy();
      expect(textOf(item, "pubDate")).toMatch(/^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} (GMT|[+-]\d{4})$/);
    }
  });
});

describe("fa feed", () => {
  it("is in Persian with the one post of the locale", async () => {
    const { doc } = await fetchFeed("fa");
    expect(doc.querySelector("parsererror")).toBeNull();
    expect(textOf(doc.querySelector("channel")!, "language")).toBe("fa");
    const items = [...doc.querySelectorAll("channel > item")];
    expect(items).toHaveLength(1);
    expect(textOf(items[0], "title")).toBe("ساخت پورتفولیوی ایستا");
    expect(textOf(items[0], "link")).toBe(`${ORIGIN}${BASE}/fa/posts/${SHARED}/`);
  });
});

describe("escaping", () => {
  it("escapes special characters so the feed stays well-formed", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "feed-fixture-"));
    const en = JSON.parse(readFileSync(path.join(FIXTURES, "en.json"), "utf8"));
    en.posts[0].title = 'Tom & Jerry <b>"quoted"</b> \'x\'';
    en.posts[0].summary = "1 < 2 & 3 > 2 ]]> done";
    writeFileSync(path.join(dir, "en.json"), JSON.stringify(en));
    writeFileSync(path.join(dir, "fa.json"), readFileSync(path.join(FIXTURES, "fa.json")));
    writeFileSync(path.join(dir, "meta.json"), readFileSync(path.join(FIXTURES, "meta.json")));
    vi.stubEnv("CONTENT_DIR", dir);
    try {
      const { text, doc } = await fetchFeed("en");
      expect(doc.querySelector("parsererror")).toBeNull();
      const first = doc.querySelector("channel > item")!;
      expect(textOf(first, "title")).toBe('Tom & Jerry <b>"quoted"</b> \'x\'');
      expect(textOf(first, "description")).toBe("1 < 2 & 3 > 2 ]]> done");
      expect(text).not.toContain("<b>");
    } finally {
      vi.stubEnv("CONTENT_DIR", FIXTURES);
    }
  });
});
