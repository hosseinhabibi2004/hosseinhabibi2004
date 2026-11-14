// Typed reader for the snapshot written by `pnpm sync`. Server-only by construction
// (node:fs). The directory is CONTENT_DIR, default `<web>/.content`.
import { readFileSync } from "node:fs";
import path from "node:path";

import type {
  PublicEducation,
  PublicExperience,
  PublicPostDetail,
  PublicProfile,
  PublicProjectDetail,
  PublicSkillGroup,
  Snapshot,
} from "./types";

export type { Snapshot, SnapshotMeta } from "./types";

export interface TagWithCount {
  slug: string;
  name: string;
  postCount: number;
}

const LOCALES = ["en", "fa"] as const;
const WEB_DIR = path.resolve(import.meta.dirname, "../../..");

function contentDir(): string {
  return process.env.CONTENT_DIR
    ? path.resolve(process.env.CONTENT_DIR)
    : path.join(WEB_DIR, ".content");
}

const cache = new Map<string, Snapshot>();

function snapshot(lng: string): Snapshot {
  const dir = contentDir();
  const key = `${dir}\0${lng}`;
  let data = cache.get(key);
  if (!data) {
    const file = path.join(dir, `${lng}.json`);
    let raw: string;
    try {
      raw = readFileSync(file, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(
          `Content snapshot not found: ${file}. Run \`pnpm sync\` (the API must be running) first.`,
        );
      }
      throw error;
    }
    data = JSON.parse(raw) as Snapshot;
    cache.set(key, data);
  }
  return data;
}

export function getPosts(lng: string): PublicPostDetail[] {
  return [...snapshot(lng).posts].sort((a, b) => b.published_at.localeCompare(a.published_at));
}

export function getPost(lng: string, slug: string): PublicPostDetail | undefined {
  return snapshot(lng).posts.find((p) => p.slug === slug);
}

export function getPostsByTag(lng: string, tagSlug: string): PublicPostDetail[] {
  return getPosts(lng).filter((p) => p.tags.some((t) => t.slug === tagSlug));
}

/** Tags with at least one post in the locale, most used first. */
export function getTags(lng: string): TagWithCount[] {
  const tags = new Map<string, TagWithCount>();
  for (const post of snapshot(lng).posts) {
    for (const tag of post.tags) {
      const entry = tags.get(tag.slug);
      if (entry) entry.postCount += 1;
      else tags.set(tag.slug, { slug: tag.slug, name: tag.name, postCount: 1 });
    }
  }
  return [...tags.values()].sort(
    (a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name),
  );
}

export function getProjects(lng: string): PublicProjectDetail[] {
  return snapshot(lng).projects;
}

export function getProject(lng: string, slug: string): PublicProjectDetail | undefined {
  return snapshot(lng).projects.find((p) => p.slug === slug);
}

export function getProfile(lng: string): PublicProfile | null {
  return snapshot(lng).profile;
}

export function getSkills(lng: string): PublicSkillGroup[] {
  return snapshot(lng).skills;
}

export function getExperience(lng: string): PublicExperience[] {
  return snapshot(lng).experience;
}

export function getEducation(lng: string): PublicEducation[] {
  return snapshot(lng).education;
}

/** Every route path of `lng` mapped to the same page in the other locale, or null. */
export function getTwinPaths(lng: string): Record<string, string | null> {
  const other = LOCALES.find((l) => l !== lng) ?? lng;
  const paths: Record<string, string | null> = {};
  const twin = (suffix: string, published: boolean) => {
    paths[`/${lng}${suffix}`] = published ? `/${other}${suffix}` : null;
  };
  for (const page of ["/", "/about/", "/posts/", "/projects/", "/tags/", "/contact/"]) {
    twin(page, true);
  }
  const otherPosts = new Set(getPosts(other).map((p) => p.slug));
  for (const post of getPosts(lng)) twin(`/posts/${post.slug}/`, otherPosts.has(post.slug));
  const otherProjects = new Set(getProjects(other).map((p) => p.slug));
  for (const project of getProjects(lng)) {
    twin(`/projects/${project.slug}/`, otherProjects.has(project.slug));
  }
  const otherTags = new Set(getTags(other).map((t) => t.slug));
  for (const tag of getTags(lng)) twin(`/tags/${tag.slug}/`, otherTags.has(tag.slug));
  return paths;
}
