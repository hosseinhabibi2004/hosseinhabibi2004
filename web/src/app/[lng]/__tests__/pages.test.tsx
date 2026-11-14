// Contract (plan C1-C7, D1)
// Each page module under `src/app/[lng]/` default-exports an ASYNC SERVER component
//   Page({ params: Promise<{ lng, slug? }> }): Promise<ReactElement>
// that reads the snapshot through `@/lib/content` (CONTENT_DIR = the fixture here) and
// translates with getT. The tests await it and render the element with `renderWithI18n`, so
// the returned tree may use client components and `useT`. The Markdown renderer is an async
// server component, so pages must use it as an element (`<Markdown source=... />`); the
// tests replace it with a wrapper that resolves the real one through React `use`.
// `notFound()` is mocked to throw an Error named NEXT_NOT_FOUND.
// Every page module also exports `generateMetadata({ params })`. Dynamic pages export
// `generateStaticParams({ params: { lng } })` (Next passes the parent's params as a plain
// object) returning `{ slug }` objects for that locale, and `dynamicParams = false`.
// For a locale with no posts/projects/tags, the content of generateStaticParams is the
// implementer's design (Next's export rules); it must only return an array without throwing.
// Home: h1, profile name and headline, skill group titles, experience companies, the hero
// illustration (<img> whose src ends in /illustrations/hero.svg, non-empty alt), the featured
// project in en. Projects are numbered (01, 02). Contact: mailto link and profile links, no form.
import path from "node:path";

import { screen, within } from "@testing-library/react";
import { initServerI18next } from "next-i18next/server";
import { Suspense, type ReactElement } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { i18nConfig } from "@/i18n/config";
import { renderWithI18n } from "@/i18n/test-utils";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  usePathname: () => "/en/",
  useParams: () => ({ lng: "en" }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/Markdown/Markdown", async (importActual) => {
  const actual = await importActual<typeof import("@/components/Markdown/Markdown")>();
  const { use } = await import("react");
  const cache = new Map<string, Promise<ReactElement>>();
  function Markdown(props: Parameters<typeof actual.Markdown>[0]) {
    let promise = cache.get(props.source);
    if (!promise) {
      promise = actual.Markdown(props);
      cache.set(props.source, promise);
    }
    return use(promise);
  }
  return { ...actual, Markdown };
});

const FIXTURES = path.resolve(import.meta.dirname, "../../../lib/content/__fixtures__");
const SHARED = "building-a-static-portfolio";
const EN_ONLY = "notes-on-drf-envelopes";

type Lng = "en" | "fa";
interface PageModule {
  default: (props: { params: Promise<Record<string, string>> }) => Promise<ReactElement>;
  generateMetadata?: (props: { params: Promise<Record<string, string>> }) => Promise<{
    title?: unknown;
    description?: unknown;
  }>;
  generateStaticParams?: (props: { params: { lng: string } }) => unknown;
  dynamicParams?: boolean;
}

const pages = {
  home: () => import("@/app/[lng]/page"),
  about: () => import("@/app/[lng]/about/page"),
  posts: () => import("@/app/[lng]/posts/page"),
  post: () => import("@/app/[lng]/posts/[slug]/page"),
  projects: () => import("@/app/[lng]/projects/page"),
  project: () => import("@/app/[lng]/projects/[slug]/page"),
  tags: () => import("@/app/[lng]/tags/page"),
  tag: () => import("@/app/[lng]/tags/[slug]/page"),
  contact: () => import("@/app/[lng]/contact/page"),
} satisfies Record<string, () => Promise<unknown>>;
type PageName = keyof typeof pages;

async function load(name: PageName): Promise<PageModule> {
  return (await pages[name]()) as unknown as PageModule;
}

async function renderPage(name: PageName, lng: Lng, slug?: string) {
  const mod = await load(name);
  const params = Promise.resolve(slug === undefined ? { lng } : { lng, slug });
  const element = await mod.default({ params });
  return renderWithI18n(<Suspense fallback={null}>{element}</Suspense>, lng);
}

function hrefs(container: HTMLElement, pattern: RegExp): string[] {
  const found = [...container.querySelectorAll("a")]
    .map((a) => a.getAttribute("href") ?? "")
    .filter((h) => pattern.test(h));
  return [...new Set(found)];
}

beforeAll(() => {
  vi.stubEnv("CONTENT_DIR", FIXTURES);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.github.io");
  vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/portfolio");
  vi.stubEnv("BACKEND_API_URL", "http://localhost:8000");
  initServerI18next(i18nConfig);
});

describe("every page module", () => {
  it.each(Object.keys(pages) as PageName[])("%s exports generateMetadata", async (name) => {
    const mod = await load(name);
    expect(typeof mod.generateMetadata).toBe("function");
  });

  it.each(["post", "project", "tag"] as const)(
    "%s is a closed dynamic route with generateStaticParams",
    async (name) => {
      const mod = await load(name);
      expect(mod.dynamicParams).toBe(false);
      expect(typeof mod.generateStaticParams).toBe("function");
      for (const lng of ["en", "fa"]) {
        expect(Array.isArray(await mod.generateStaticParams!({ params: { lng } }))).toBe(true);
      }
    },
  );
});

describe("home", () => {
  it("renders the profile, skills, experience, illustration and featured project in en", async () => {
    const { container } = await renderPage("home", "en");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("Hossein Habibi").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Software engineer building Django APIs and Next.js sites").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Backend").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Frontend").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Acme Software/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pixel Studio/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Portfolio site").length).toBeGreaterThan(0);

    const hero = [...container.querySelectorAll("img")].find((img) =>
      decodeURIComponent(img.getAttribute("src") ?? "").includes("/illustrations/hero.svg"),
    );
    expect(hero).toBeDefined();
    expect((hero?.getAttribute("alt") ?? "").trim()).not.toBe("");
  });

  it("renders in fa without projects and without throwing", async () => {
    const { container } = await renderPage("home", "fa");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("حسین حبیبی").length).toBeGreaterThan(0);
    expect(screen.getAllByText("بک‌اند").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/اکمی سافتور/).length).toBeGreaterThan(0);
    expect(screen.queryByText("Portfolio site")).toBeNull();
    expect(hrefs(container, /\/projects\/[^/]+\/$/)).toEqual([]);
  });
});

describe("about", () => {
  it.each([
    ["en", "I design and build web products end to end, from the database to the pixels.", ["Acme Software", "Pixel Studio"], "University of Tehran"],
    ["fa", "محصولات وب را از پایگاه داده تا رابط کاربری طراحی و پیاده‌سازی می‌کنم.", ["اکمی سافتور", "پیکسل استودیو"], "دانشگاه تهران"],
  ] as const)("renders summary, experience, education and skills in %s", async (lng, summary, companies, institution) => {
    await renderPage("about", lng);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(summary).length).toBeGreaterThan(0);
    for (const company of companies) {
      expect(screen.getAllByText(new RegExp(company)).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText(new RegExp(institution)).length).toBeGreaterThan(0);
    for (const skill of ["Python", "Django", "PostgreSQL", "TypeScript", "React", "Next.js"]) {
      expect(screen.getAllByText(skill).length).toBeGreaterThan(0);
    }
  });
});

describe("posts list", () => {
  it("lists both posts newest first in en", async () => {
    const { container } = await renderPage("posts", "en");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    const links = hrefs(container, /\/en\/posts\/[^/]+\/$/);
    expect(links.map((h) => h.replace(/^.*\/en\/posts\//, ""))).toEqual([
      `${EN_ONLY}/`,
      `${SHARED}/`,
    ]);
  });

  it("lists the one post in fa", async () => {
    const { container } = await renderPage("posts", "fa");
    const links = hrefs(container, /\/fa\/posts\/[^/]+\/$/);
    expect(links).toHaveLength(1);
    expect(links[0]).toMatch(new RegExp(`/fa/posts/${SHARED}/$`));
    expect(screen.getAllByText("ساخت پورتفولیوی ایستا").length).toBeGreaterThan(0);
  });
});

describe("post page", () => {
  it("renders title, date, Markdown body and tag links in en", async () => {
    const { container } = await renderPage("post", "en", SHARED);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Building a static portfolio");
    expect(container.querySelector("time")).not.toBeNull();
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(container.querySelector("pre code")?.textContent).toContain("readSnapshot(lng).posts");
    expect(container.querySelector("script")).toBeNull();
    const tagLinks = hrefs(container, /\/en\/tags\/[^/]+\/$/);
    expect(tagLinks.some((h) => h.endsWith("/en/tags/nextjs/"))).toBe(true);
    expect(tagLinks.some((h) => h.endsWith("/en/tags/django/"))).toBe(true);
  });

  it("renders the fa post with its body and no tags", async () => {
    const { container } = await renderPage("post", "fa", SHARED);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("ساخت پورتفولیوی ایستا");
    expect(await screen.findByText("مرحله ساخت")).toBeInTheDocument();
    expect(hrefs(container, /\/fa\/tags\/[^/]+\/$/)).toEqual([]);
  });

  it("calls notFound for an unknown slug and for a slug of the other locale", async () => {
    await expect(renderPage("post", "en", "no-such-post")).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(renderPage("post", "fa", EN_ONLY)).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("generateStaticParams returns the slugs of the locale", async () => {
    const mod = await load("post");
    const en = (await mod.generateStaticParams!({ params: { lng: "en" } })) as { slug: string }[];
    const fa = (await mod.generateStaticParams!({ params: { lng: "fa" } })) as { slug: string }[];
    expect(en.map((p) => p.slug).sort()).toEqual([EN_ONLY, SHARED].sort());
    expect(fa.map((p) => p.slug)).toEqual([SHARED]);
  });

  it("generateMetadata returns the post title and its summary", async () => {
    const mod = await load("post");
    const meta = await mod.generateMetadata!({ params: Promise.resolve({ lng: "en", slug: SHARED }) });
    expect(meta.title).toBe("Building a static portfolio");
    expect(meta.description).toBe("Why I moved my portfolio to a static export.");
  });
});

describe("projects", () => {
  it("lists numbered projects in en", async () => {
    const { container } = await renderPage("projects", "en");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getAllByText("Portfolio site").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Invoice API").length).toBeGreaterThan(0);
    expect(container.querySelector('a[href="https://github.com/hosseinhabibi2004/invoice-api"]')).not.toBeNull();
  });

  it("shows an empty state in fa", async () => {
    const { container } = await renderPage("projects", "fa");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.queryByText("01")).toBeNull();
    expect(container.querySelectorAll("article")).toHaveLength(0);
  });

  it("detail shows title, body and links", async () => {
    const { container } = await renderPage("project", "en", "habibi-portfolio");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Portfolio site");
    expect(await screen.findByText("Persian and English")).toBeInTheDocument();
    expect(container.querySelector('a[href="https://github.com/hosseinhabibi2004/hosseinhabibi2004"]')).not.toBeNull();
    expect(container.querySelector('a[href="https://hosseinhabibi.dev"]')).not.toBeNull();
  });

  it("detail without a live URL has no empty link, and an unknown slug is not found", async () => {
    const { container } = await renderPage("project", "en", "invoice-api");
    expect(container.querySelector('a[href=""]')).toBeNull();
    await expect(renderPage("project", "en", "nope")).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(renderPage("project", "fa", "habibi-portfolio")).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("generateStaticParams for en contains both slugs", async () => {
    const mod = await load("project");
    const en = (await mod.generateStaticParams!({ params: { lng: "en" } })) as { slug: string }[];
    expect(en.map((p) => p.slug)).toEqual(expect.arrayContaining(["habibi-portfolio", "invoice-api"]));
  });
});

describe("tags", () => {
  it("index lists only used tags with their post counts", async () => {
    const { container } = await renderPage("tags", "en");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    const text = container.textContent ?? "";
    expect(text).toMatch(/Django\D{0,12}2/);
    expect(text).toMatch(/Next\.js\D{0,12}1/);
    expect(text).not.toContain("Unused");
    expect(hrefs(container, /\/en\/tags\/[^/]+\/$/).sort()).toEqual(
      expect.arrayContaining([expect.stringMatching(/\/en\/tags\/django\/$/), expect.stringMatching(/\/en\/tags\/nextjs\/$/)]),
    );
  });

  it("index in fa has no tags and does not throw", async () => {
    const { container } = await renderPage("tags", "fa");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(hrefs(container, /\/fa\/tags\/[^/]+\/$/)).toEqual([]);
  });

  it("tag page lists the posts with that tag", async () => {
    const { container } = await renderPage("tag", "en", "django");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Django");
    expect(hrefs(container, /\/en\/posts\/[^/]+\/$/)).toHaveLength(2);

    const next = await renderPage("tag", "en", "nextjs");
    const only = hrefs(next.container, /\/en\/posts\/[^/]+\/$/);
    expect(only).toHaveLength(1);
    expect(only[0]).toMatch(new RegExp(`/en/posts/${SHARED}/$`));
  });

  it("an unused or unknown tag is not found", async () => {
    await expect(renderPage("tag", "en", "unused-tag")).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(renderPage("tag", "en", "nope")).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("generateStaticParams for en lists only used tags", async () => {
    const mod = await load("tag");
    const en = (await mod.generateStaticParams!({ params: { lng: "en" } })) as { slug: string }[];
    expect(en.map((p) => p.slug).sort()).toEqual(["django", "nextjs"]);
  });
});

describe("contact", () => {
  it.each(["en", "fa"] as const)("has mailto and profile links and no form in %s", async (lng) => {
    const { container } = await renderPage("contact", lng);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(container.querySelector('a[href="mailto:hello@hosseinhabibi.dev"]')).not.toBeNull();
    expect(container.querySelector('a[href="https://github.com/hosseinhabibi2004"]')).not.toBeNull();
    expect(container.querySelector('a[href="https://www.linkedin.com/in/hosseinhabibi"]')).not.toBeNull();
    expect(container.querySelector("form, input, textarea, select")).toBeNull();
    expect(within(container).queryByRole("textbox")).toBeNull();
  });
});
