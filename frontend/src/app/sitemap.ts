import type { MetadataRoute } from "next";

import { locales } from "@/lib/locale";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Locale roots only. Each content page adds its own entries (with `alternates`
// for the other locale) when it exists.
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((lng) => ({
    url: absoluteUrl(`/${lng}/`),
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(`/${l}/`)])),
    },
  }));
}
