import type { MetadataRoute } from "next";

import { getPosts, getTwinPaths } from "@/lib/content";
import { locales } from "@/lib/locale";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Every route of the snapshot, in both locales. `getTwinPaths` already lists each page of a locale
// with its twin in the other one (or null when it is not published there).
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((lng) => {
    const published = new Map(getPosts(lng).map((p) => [`/${lng}/posts/${p.slug}/`, p.published_at]));
    return Object.entries(getTwinPaths(lng)).map(([path, twin]) => {
      const other = locales.find((l) => l !== lng);
      const languages: Record<string, string> = { [lng]: absoluteUrl(path) };
      if (twin && other) languages[other] = absoluteUrl(twin);
      const date = published.get(path);
      return {
        url: absoluteUrl(path),
        ...(date ? { lastModified: date } : {}),
        alternates: { languages },
      };
    });
  });
}
