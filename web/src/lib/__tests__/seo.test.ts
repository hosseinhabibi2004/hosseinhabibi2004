// Contract (plan D1): `@/lib/seo` is pure and reads the site origin and base path through
// `@/lib/site` (absoluteUrl).
//   buildMetadata({ lng, path, title?, description?, image?, type?, publishedTime?, twinPath })
//     path      full site path of the page including the locale, e.g. "/en/posts/x/"
//     twinPath  full site path of the same page in the other locale, or null when unpublished
//     image     URL or path as stored in the snapshot (it already includes the base path);
//               made absolute against the site origin only, never prefixed twice
//     type      "website" (default) | "article"
//   -> Next `Metadata`: title, description, alternates.canonical (absolute, base path,
//      trailing slash), alternates.languages (both locales with a twin, only `lng` without),
//      openGraph { title, description, url, locale fa_IR | en_US, type, publishedTime, images }.
//      Without `image`, openGraph.images is the default per-locale image, whose URL starts with
//      <origin><base>/<lng>/opengraph-image.
//   personJsonLd(profile, lng)   -> { "@context": "https://schema.org", "@type": "Person",
//                                     name, url: home of lng, sameAs: profile link URLs }
//   blogPostingJsonLd(post, lng) -> { "@context", "@type": "BlogPosting", headline, description,
//                                     url, datePublished: published_at }
import path from "node:path";

import { beforeAll, describe, expect, it, vi } from "vitest";

const FIXTURES = path.resolve(import.meta.dirname, "../content/__fixtures__");
const ORIGIN = "https://example.github.io";
const BASE = "/portfolio";

type Seo = typeof import("@/lib/seo");
let seo: Seo;
let content: typeof import("@/lib/content");

beforeAll(async () => {
  vi.stubEnv("CONTENT_DIR", FIXTURES);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", ORIGIN);
  vi.stubEnv("NEXT_PUBLIC_BASE_PATH", BASE);
  vi.stubEnv("BACKEND_API_URL", "http://localhost:8000");
  seo = await import("@/lib/seo");
  content = await import("@/lib/content");
});

function imageUrls(meta: Awaited<ReturnType<Seo["buildMetadata"]>> | ReturnType<Seo["buildMetadata"]>): string[] {
  const images = (meta.openGraph as { images?: unknown } | undefined)?.images;
  const list = Array.isArray(images) ? images : images ? [images] : [];
  return list.map((i) => (typeof i === "string" ? i : (i as { url: string | URL }).url.toString()));
}

describe("buildMetadata", () => {
  const base = { lng: "en" as const, path: "/en/posts/x/", twinPath: "/fa/posts/x/" };

  it("builds an absolute canonical URL with the base path and trailing slash", () => {
    const meta = seo.buildMetadata({ ...base, title: "T", description: "D" });
    expect(meta.alternates?.canonical).toBe(`${ORIGIN}${BASE}/en/posts/x/`);
    expect(meta.title).toBe("T");
    expect(meta.description).toBe("D");
  });

  it("lists both locales as alternates when a twin exists", () => {
    const meta = seo.buildMetadata(base);
    expect(meta.alternates?.languages).toEqual({
      en: `${ORIGIN}${BASE}/en/posts/x/`,
      fa: `${ORIGIN}${BASE}/fa/posts/x/`,
    });
  });

  it("lists only its own locale when there is no twin", () => {
    const meta = seo.buildMetadata({ ...base, twinPath: null });
    expect(Object.keys(meta.alternates?.languages ?? {})).toEqual(["en"]);
  });

  it("keys the own locale correctly for fa", () => {
    const meta = seo.buildMetadata({ lng: "fa", path: "/fa/about/", twinPath: "/en/about/" });
    expect(meta.alternates?.canonical).toBe(`${ORIGIN}${BASE}/fa/about/`);
    expect(meta.alternates?.languages).toEqual({
      fa: `${ORIGIN}${BASE}/fa/about/`,
      en: `${ORIGIN}${BASE}/en/about/`,
    });
  });

  it("uses the given image, made absolute, as the Open Graph image", () => {
    const meta = seo.buildMetadata({ ...base, image: `${BASE}/media/cover00001.jpg` });
    expect(imageUrls(meta)).toEqual([`${ORIGIN}${BASE}/media/cover00001.jpg`]);
    const abs = seo.buildMetadata({ ...base, image: "https://cdn.example/x.png" });
    expect(imageUrls(abs)).toEqual(["https://cdn.example/x.png"]);
  });

  it("falls back to the default per-locale image", () => {
    for (const lng of ["en", "fa"] as const) {
      const other = lng === "en" ? "fa" : "en";
      const meta = seo.buildMetadata({ lng, path: `/${lng}/`, twinPath: `/${other}/` });
      const urls = imageUrls(meta);
      expect(urls).toHaveLength(1);
      expect(urls[0].startsWith(`${ORIGIN}${BASE}/${lng}/opengraph-image`)).toBe(true);
    }
  });

  it("sets the Open Graph locale, url and title", () => {
    const en = seo.buildMetadata({ ...base, title: "T", description: "D" });
    const fa = seo.buildMetadata({ lng: "fa", path: "/fa/", twinPath: null });
    expect(en.openGraph).toMatchObject({ locale: "en_US", title: "T", description: "D", url: `${ORIGIN}${BASE}/en/posts/x/` });
    expect(fa.openGraph).toMatchObject({ locale: "fa_IR" });
  });

  it("is a website by default and an article with publishedTime for posts", () => {
    expect(seo.buildMetadata(base).openGraph).toMatchObject({ type: "website" });
    const post = seo.buildMetadata({ ...base, type: "article", publishedTime: "2026-03-10T09:00:00Z" });
    expect(post.openGraph).toMatchObject({ type: "article", publishedTime: "2026-03-10T09:00:00Z" });
  });
});

describe("JSON-LD", () => {
  it("personJsonLd describes the profile", () => {
    const profile = content.getProfile("en")!;
    const ld = seo.personJsonLd(profile, "en") as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Person");
    expect(ld.name).toBe("Hossein Habibi");
    expect(ld.url).toBe(`${ORIGIN}${BASE}/en/`);
    expect(ld.sameAs).toEqual(
      expect.arrayContaining(["https://github.com/hosseinhabibi2004", "https://www.linkedin.com/in/hosseinhabibi"]),
    );
  });

  it("blogPostingJsonLd describes a post", () => {
    const post = content.getPost("en", "building-a-static-portfolio")!;
    const ld = seo.blogPostingJsonLd(post, "en") as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe("Building a static portfolio");
    expect(ld.description).toBe("Why I moved my portfolio to a static export.");
    expect(ld.url).toBe(`${ORIGIN}${BASE}/en/posts/building-a-static-portfolio/`);
    expect(ld.datePublished).toBe("2026-03-10T09:00:00Z");
  });
});
