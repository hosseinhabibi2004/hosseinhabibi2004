import { env } from "@/env";

/** Absolute URL of a path on the deployed site, including the base path. */
export function absoluteUrl(path = "/"): string {
  const origin = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return `${origin}${env.NEXT_PUBLIC_BASE_PATH}${path}`;
}

/** URL of a file in `public/`, with the base path (a static export may be served from a sub-path). */
export function assetPath(path: string): string {
  return `${env.NEXT_PUBLIC_BASE_PATH}${path}`;
}
