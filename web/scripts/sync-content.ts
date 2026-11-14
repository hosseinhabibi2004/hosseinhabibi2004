// Snapshot the Public API into local JSON and images, once, before `next build`.
// Run by `pnpm sync` (and `prebuild`). Env: CONTENT_DIR (default `.content`),
// MEDIA_DIR (default `public/media`), plus the SDK's BACKEND_API_URL / NEXT_PUBLIC_BASE_PATH.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { env } from "@/env";
import { Public } from "@/sdk/generated";
import type {
  PublicImage,
  PublicPostDetail,
  PublicProjectDetail,
  Snapshot,
  SnapshotCounts,
  SnapshotMeta,
} from "@/lib/content/types";

const LOCALES = ["en", "fa"] as const;
const contentDir = path.resolve(process.env.CONTENT_DIR || ".content");
const mediaDir = path.resolve(process.env.MEDIA_DIR || "public/media");
const basePath = env.NEXT_PUBLIC_BASE_PATH;

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

const downloads = new Map<string, Promise<string>>();

/** Download an image once into MEDIA_DIR and return its public path. */
function localize(url: string): Promise<string> {
  let pending = downloads.get(url);
  if (!pending) {
    pending = (async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Image ${url} answered ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const type = (response.headers.get("content-type") ?? "").split(";")[0].trim();
      const ext = EXT_BY_TYPE[type] ?? (path.extname(new URL(url).pathname) || ".bin");
      const file = `${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}${ext}`;
      mkdirSync(mediaDir, { recursive: true });
      writeFileSync(path.join(mediaDir, file), bytes);
      return `${basePath}/media/${file}`;
    })();
    downloads.set(url, pending);
  }
  return pending;
}

async function localizeImage(image: PublicImage | null): Promise<PublicImage | null> {
  return image ? { ...image, url: await localize(image.url) } : null;
}

const MARKDOWN_IMAGE = /(!\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;

/** Rewrite `![alt](url)` to local files; relative URLs are left alone. */
async function localizeBody(body: string): Promise<string> {
  const matches = [...body.matchAll(MARKDOWN_IMAGE)].filter((m) => /^https?:\/\//.test(m[2]));
  const local = await Promise.all(matches.map((m) => localize(m[2])));
  const byUrl = new Map(matches.map((m, i) => [m[2], local[i]]));
  return body.replace(MARKDOWN_IMAGE, (whole, pre: string, url: string, post: string) =>
    byUrl.has(url) ? `${pre}${byUrl.get(url)}${post}` : whole,
  );
}

function unwrap<T>(
  what: string,
  out: { data?: { result: T } | undefined; response?: Response },
  allow404 = false,
): T | null {
  if (out.response?.status === 404 && allow404) return null;
  if (!out.response?.ok || !out.data) {
    throw new Error(`${what} failed: ${out.response ? `HTTP ${out.response.status}` : "no response"}`);
  }
  return out.data.result;
}

async function snapshot(locale: (typeof LOCALES)[number]): Promise<Snapshot> {
  const path_ = { locale };
  const opts = { path: path_, throwOnError: false } as const;
  const [posts, projects, tags, skills, experience, education, profile] = await Promise.all([
    Public.postsList(opts).then((r) => unwrap(`${locale} posts`, r)!),
    Public.projectsList(opts).then((r) => unwrap(`${locale} projects`, r)!),
    Public.tagsList(opts).then((r) => unwrap(`${locale} tags`, r)!),
    Public.skillsList(opts).then((r) => unwrap(`${locale} skills`, r)!),
    Public.experienceList(opts).then((r) => unwrap(`${locale} experience`, r)!),
    Public.educationList(opts).then((r) => unwrap(`${locale} education`, r)!),
    Public.profileRetrieve(opts).then((r) => unwrap(`${locale} profile`, r, true)),
  ]);

  const postDetails: PublicPostDetail[] = await Promise.all(
    posts.map(async ({ slug }) => {
      const r = await Public.postsRetrieve({ path: { locale, slug }, throwOnError: false });
      const post = unwrap(`${locale} post ${slug}`, r)!;
      return {
        ...post,
        cover_image: await localizeImage(post.cover_image),
        body: await localizeBody(post.body),
      };
    }),
  );
  const projectDetails: PublicProjectDetail[] = await Promise.all(
    projects.map(async ({ slug }) => {
      const r = await Public.projectsRetrieve({ path: { locale, slug }, throwOnError: false });
      const project = unwrap(`${locale} project ${slug}`, r)!;
      return {
        ...project,
        cover_image: await localizeImage(project.cover_image),
        body: await localizeBody(project.body),
      };
    }),
  );

  return {
    profile: profile ? { ...profile, avatar: await localizeImage(profile.avatar) } : null,
    posts: postDetails,
    projects: projectDetails,
    tags,
    skills,
    experience,
    education,
  };
}

async function main() {
  const counts: Record<string, SnapshotCounts> = {};
  mkdirSync(contentDir, { recursive: true });
  for (const locale of LOCALES) {
    const data = await snapshot(locale);
    counts[locale] = {
      posts: data.posts.length,
      projects: data.projects.length,
      tags: data.tags.length,
      skills: data.skills.length,
      experience: data.experience.length,
      education: data.education.length,
    };
    writeFileSync(path.join(contentDir, `${locale}.json`), JSON.stringify(data, null, 2) + "\n");
  }
  const meta: SnapshotMeta = { generatedAt: new Date().toISOString(), counts };
  writeFileSync(path.join(contentDir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
  console.log(`Synced ${LOCALES.join(", ")} to ${contentDir} (${downloads.size} images)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
