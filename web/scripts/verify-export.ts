// Export check: reads `out/` after `pnpm build` and asserts the static site is complete and
// self-contained, for the snapshot the build used (CONTENT_DIR, default `.content`).
//
//   pnpm build && pnpm verify:export
//
// Build AND verify with the same, non-local site URL, because `.env` defaults NEXT_PUBLIC_SITE_URL to
// http://localhost:3000 and the check fails on any localhost URL:
//
//   export NEXT_PUBLIC_SITE_URL=https://example.github.io NEXT_PUBLIC_BASE_PATH=/portfolio
//   pnpm build && pnpm verify:export
//
// On a fixture (`SKIP_SYNC=1 CONTENT_DIR=src/lib/content/__fixtures__`) the snapshot references
// /media/* files that `pnpm sync` would have downloaded: put placeholder files with those names in
// `public/media/` (gitignored) before building so the image check stays real.
//
// It is a vitest file run through vitest.export.config.ts, so `pnpm test` does not include it.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { getTwinPaths } from "@/lib/content";

const OUT = path.resolve(process.cwd(), "out");
const LOCALES = ["en", "fa"] as const;
const DIR = { en: "ltr", fa: "rtl" } as const;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ORIGIN = new URL(SITE_URL).origin;
const SITE = `${SITE_URL}${BASE_PATH}`;
const LOCAL = /(localhost|127\.0\.0\.1)/i;

if (LOCAL.test(SITE_URL)) {
  throw new Error(
    `NEXT_PUBLIC_SITE_URL is ${SITE_URL}: the export check needs a real site URL for both the build and ` +
      "this check, e.g. NEXT_PUBLIC_SITE_URL=https://example.github.io NEXT_PUBLIC_BASE_PATH=/portfolio.",
  );
}
if (!existsSync(OUT)) throw new Error(`${OUT} does not exist: run \`pnpm build\` first.`);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
}

const rel = (file: string) => path.relative(OUT, file);
const isFile = (file: string) => existsSync(file) && statSync(file).isFile();
const pageFile = (route: string) => path.join(OUT, route, "index.html");
const html = (file: string) => new JSDOM(readFileSync(file, "utf8")).window.document;

/** The file in out/ a URL of this site points at, or null when it points elsewhere. */
function localFile(url: string): string | null {
  let pathname: string;
  if (url.startsWith("/") && !url.startsWith("//")) pathname = url;
  else if (/^https?:\/\//i.test(url) && new URL(url).origin === ORIGIN) pathname = new URL(url).pathname;
  else return null;
  pathname = decodeURIComponent(pathname.split(/[?#]/)[0]);
  if (BASE_PATH && (pathname === BASE_PATH || pathname.startsWith(`${BASE_PATH}/`))) {
    pathname = pathname.slice(BASE_PATH.length) || "/";
  }
  const target = path.join(OUT, pathname);
  return pathname.endsWith("/") ? path.join(target, "index.html") : target;
}

const routes = LOCALES.flatMap((lng) =>
  Object.entries(getTwinPaths(lng)).map(([route, twin]) => ({ lng, route, twin })),
);
const files = walk(OUT);
const textFiles = files.filter((f) => /\.(html|xml)$/.test(f));

describe("static export", () => {
  it("has a file for every route of both locales", () => {
    const missing = routes.filter((r) => !isFile(pageFile(r.route))).map((r) => r.route);
    expect(missing).toEqual([]);
    for (const lng of LOCALES) expect(isFile(path.join(OUT, lng, "feed.xml"))).toBe(true);
  });

  it("sets <html lang dir> to the page's locale", () => {
    const wrong = routes.flatMap(({ lng, route }) => {
      const root = html(pageFile(route)).documentElement;
      return root.lang === lng && root.dir === DIR[lng] ? [] : [`${route}: lang=${root.lang} dir=${root.dir}`];
    });
    expect(wrong).toEqual([]);
  });

  it("has an absolute canonical URL with the base path", () => {
    const wrong = routes.flatMap(({ route }) => {
      const href = html(pageFile(route)).querySelector('link[rel="canonical"]')?.getAttribute("href");
      return href === `${SITE}${route}` ? [] : [`${route}: canonical=${href}`];
    });
    expect(wrong).toEqual([]);
  });

  it("lists hreflang alternates only for published twins", () => {
    const wrong = routes.flatMap(({ lng, route, twin }) => {
      const alt: Record<string, string> = {};
      for (const l of html(pageFile(route)).querySelectorAll('link[rel="alternate"][hreflang]')) {
        alt[l.getAttribute("hreflang") ?? ""] = l.getAttribute("href") ?? "";
      }
      const expected: Record<string, string> = { [lng]: `${SITE}${route}` };
      if (twin) expected[LOCALES.find((l) => l !== lng)!] = `${SITE}${twin}`;
      return JSON.stringify(alt, Object.keys(alt).sort()) === JSON.stringify(expected, Object.keys(expected).sort())
        ? []
        : [`${route}: ${JSON.stringify(alt)} expected ${JSON.stringify(expected)}`];
    });
    expect(wrong).toEqual([]);
  });

  it("maps every sitemap <loc> to a file", () => {
    const doc = new JSDOM(readFileSync(path.join(OUT, "sitemap.xml"), "utf8"), { contentType: "text/xml" }).window.document;
    const locs = [...doc.getElementsByTagName("loc")].map((l) => l.textContent ?? "");
    expect(locs.length).toBe(routes.length);
    const bad = locs.filter((loc) => !loc.startsWith(`${SITE}/`) || !isFile(localFile(loc) ?? ""));
    expect(bad).toEqual([]);
  });

  it("serves well-formed RSS feeds", () => {
    for (const lng of LOCALES) {
      const doc = new JSDOM(readFileSync(path.join(OUT, lng, "feed.xml"), "utf8"), { contentType: "text/xml" }).window.document;
      expect(doc.getElementsByTagName("parsererror").length, `${lng}/feed.xml`).toBe(0);
      expect(doc.documentElement.tagName).toBe("rss");
    }
  });

  it("has a 404.html that is noindex", () => {
    expect(isFile(path.join(OUT, "404.html"))).toBe(true);
    const robots = [...html(path.join(OUT, "404.html")).querySelectorAll('meta[name="robots"]')].map(
      (m) => m.getAttribute("content") ?? "",
    );
    expect(robots.some((c) => c.includes("noindex"))).toBe(true);
  });

  it("has no localhost or 127.0.0.1 URL in any .html or .xml file", () => {
    const hits = textFiles.filter((f) => LOCAL.test(readFileSync(f, "utf8"))).map(rel);
    expect(hits).toEqual([]);
  });

  it("resolves every in-site <img src> and og:image to a file", () => {
    const missing: string[] = [];
    for (const { route } of routes) {
      const doc = html(pageFile(route));
      const urls = [
        ...[...doc.querySelectorAll("img[src]")].map((i) => i.getAttribute("src") ?? ""),
        ...[...doc.querySelectorAll('meta[property="og:image"]')].map((m) => m.getAttribute("content") ?? ""),
      ];
      for (const url of urls) {
        const file = localFile(url);
        if (file && !isFile(file)) missing.push(`${route}: ${url}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("leaves no `_` placeholder directories or files", () => {
    const placeholders = files.map(rel).filter((f) => f.split(path.sep).some((s) => s === "_" || s.startsWith("_.")));
    expect(placeholders).toEqual([]);
  });
});
