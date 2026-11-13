import type { Post } from "@/sdk/generated";

/** A post's title in the first language that has one, else `fallback`. */
export function postTitle(post: Post, fallback: string): string {
  return post.translations.find((row) => row.title)?.title ?? fallback;
}
