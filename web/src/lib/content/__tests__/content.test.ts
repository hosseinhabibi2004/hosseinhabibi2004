import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Snapshot shape (see scripts/__tests__/sync-content.test.ts): per locale
// { profile, posts: detail objects incl. body, projects, tags, skills, experience, education }.
// getTags returns only tags with at least one post in that locale, as
// { slug, name, postCount }. getPosts is newest first. getTwinPaths(lng) maps every route
// path of `lng` to the same page in the other locale, or null when it is not published there.

const FIXTURES = path.resolve(import.meta.dirname, "../__fixtures__");
const SHARED = "building-a-static-portfolio";
const EN_ONLY = "notes-on-drf-envelopes";

async function loadContent(dir: string) {
  vi.resetModules();
  vi.stubEnv("CONTENT_DIR", dir);
  return await import("@/lib/content");
}

describe("content reader (full fixture)", () => {
  let content: Awaited<ReturnType<typeof loadContent>>;

  beforeEach(async () => {
    content = await loadContent(FIXTURES);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("lists posts newest first", () => {
    expect(content.getPosts("en").map((p) => p.slug)).toEqual([EN_ONLY, SHARED]);
    expect(content.getPosts("fa").map((p) => p.slug)).toEqual([SHARED]);
  });

  it("finds a post by slug with its body, and returns undefined for an unknown slug", () => {
    const post = content.getPost("en", SHARED);
    expect(post?.title).toBe("Building a static portfolio");
    expect(post?.body).toContain("```ts");
    expect(content.getPost("fa", SHARED)?.title).toBe("ساخت پورتفولیوی ایستا");
    expect(content.getPost("en", "no-such-post")).toBeUndefined();
    expect(content.getPost("fa", EN_ONLY)).toBeUndefined();
  });

  it("returns only tags that have a post in the locale, with their post count", () => {
    const bySlug = Object.fromEntries(content.getTags("en").map((t) => [t.slug, t]));
    expect(Object.keys(bySlug).sort()).toEqual(["django", "nextjs"]);
    expect(bySlug.django).toMatchObject({ name: "Django", postCount: 2 });
    expect(bySlug.nextjs).toMatchObject({ name: "Next.js", postCount: 1 });
    expect(content.getTags("fa")).toEqual([]);
  });

  it("filters posts by tag", () => {
    expect(content.getPostsByTag("en", "django").map((p) => p.slug).sort()).toEqual(
      [EN_ONLY, SHARED].sort(),
    );
    expect(content.getPostsByTag("en", "nextjs").map((p) => p.slug)).toEqual([SHARED]);
    expect(content.getPostsByTag("en", "unused-tag")).toEqual([]);
    expect(content.getPostsByTag("fa", "django")).toEqual([]);
  });

  it("reads projects", () => {
    expect(content.getProjects("en")).toHaveLength(2);
    expect(content.getProjects("en").filter((p) => p.featured).map((p) => p.slug)).toEqual([
      "habibi-portfolio",
    ]);
    expect(content.getProject("en", "habibi-portfolio")?.body).toContain("static export");
    expect(content.getProject("en", "nope")).toBeUndefined();
    expect(content.getProjects("fa")).toEqual([]);
  });

  it("reads the profile, skills, experience and education per locale", () => {
    expect(content.getProfile("en")?.name).toBe("Hossein Habibi");
    expect(content.getProfile("fa")?.name).toBe("حسین حبیبی");
    expect(content.getSkills("en")).toHaveLength(2);
    expect(content.getSkills("fa")[0].title).toBe("بک‌اند");
    expect(content.getExperience("en")).toHaveLength(2);
    expect(content.getEducation("en")).toHaveLength(1);
    expect(content.getEducation("fa")[0].institution).toBe("دانشگاه تهران");
  });

  it("maps every en route to its fa twin, or null when it is not published there", () => {
    const en = content.getTwinPaths("en");
    expect(en["/en/"]).toBe("/fa/");
    expect(en["/en/about/"]).toBe("/fa/about/");
    expect(en["/en/posts/"]).toBe("/fa/posts/");
    expect(en["/en/projects/"]).toBe("/fa/projects/");
    expect(en["/en/tags/"]).toBe("/fa/tags/");
    expect(en["/en/contact/"]).toBe("/fa/contact/");
    expect(en[`/en/posts/${SHARED}/`]).toBe(`/fa/posts/${SHARED}/`);
    expect(en[`/en/posts/${EN_ONLY}/`]).toBeNull();
    expect(en["/en/projects/habibi-portfolio/"]).toBeNull();
    expect(en["/en/projects/invoice-api/"]).toBeNull();
    expect(en["/en/tags/django/"]).toBeNull();
    expect(en["/en/tags/unused-tag/"]).toBeUndefined();
  });

  it("maps every fa route back to its en twin", () => {
    const fa = content.getTwinPaths("fa");
    expect(fa["/fa/"]).toBe("/en/");
    expect(fa["/fa/about/"]).toBe("/en/about/");
    expect(fa["/fa/contact/"]).toBe("/en/contact/");
    expect(fa[`/fa/posts/${SHARED}/`]).toBe(`/en/posts/${SHARED}/`);
    expect(Object.keys(fa).some((p) => p.startsWith("/fa/projects/") && p !== "/fa/projects/")).toBe(
      false,
    );
    expect(Object.keys(fa).some((p) => p.startsWith("/fa/tags/") && p !== "/fa/tags/")).toBe(false);
  });
});

describe("content reader (sparse fixture: fa has no posts, projects or tags)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty lists instead of failing", async () => {
    const content = await loadContent(path.join(FIXTURES, "sparse"));
    expect(content.getPosts("fa")).toEqual([]);
    expect(content.getProjects("fa")).toEqual([]);
    expect(content.getTags("fa")).toEqual([]);
    expect(content.getPosts("en")).toHaveLength(1);
    expect(content.getProfile("fa")).toBeTruthy();
  });

  it("has no twin for the only en post", async () => {
    const content = await loadContent(path.join(FIXTURES, "sparse"));
    expect(content.getTwinPaths("en")["/en/posts/notes-on-drf-envelopes/"]).toBeNull();
  });
});
