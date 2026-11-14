import { notFound } from "next/navigation";

import en from "@/i18n/locales/en";
import fa from "@/i18n/locales/fa";
import { getPosts } from "@/lib/content";
import { isLocale, locales } from "@/lib/locale";
import { absoluteUrl } from "@/lib/site";

// A static RSS 2.0 feed per locale, written to out/<lng>/feed.xml at build time.
export const dynamic = "force-static";

const COMMON = { en: en.common, fa: fa.common } as const;

export function generateStaticParams() {
  return locales.map((lng) => ({ lng }));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ lng: string }> }) {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const common = COMMON[lng];

  const items = getPosts(lng)
    .map((post) => {
      const link = absoluteUrl(`/${lng}/posts/${post.slug}/`);
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const home = absoluteUrl(`/${lng}/`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(common.siteName)}</title>
    <link>${escapeXml(home)}</link>
    <description>${escapeXml(common.siteDescription)}</description>
    <language>${lng}</language>
    <atom:link href="${escapeXml(absoluteUrl(`/${lng}/feed.xml`))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
