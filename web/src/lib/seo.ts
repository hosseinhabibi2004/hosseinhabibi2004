import type { Metadata } from "next";

import type { PublicPostDetail, PublicProfile } from "@/lib/content/types";
import { locales, type Locale } from "@/lib/locale";
import { absoluteUrl } from "@/lib/site";

const OG_LOCALE: Record<Locale, string> = { en: "en_US", fa: "fa_IR" };

export interface MetadataInput {
  lng: Locale;
  /** Full site path including the locale, e.g. "/en/posts/x/". */
  path: string;
  title?: string;
  description?: string;
  /** URL or path as stored in the snapshot (already includes the base path). */
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  /** Same page in the other locale, or null when it is not published there. */
  twinPath: string | null;
}

function origin(): string {
  return new URL(absoluteUrl("/")).origin;
}

function absoluteImage(image: string): string {
  return /^(https?:)?\/\//i.test(image) ? image : `${origin()}${image}`;
}

export function buildMetadata(input: MetadataInput): Metadata {
  const { lng, path, title, description, image, type = "website", publishedTime, twinPath } = input;
  const url = absoluteUrl(path);
  const other = locales.find((l) => l !== lng);
  const languages: Record<string, string> = { [lng]: url };
  if (twinPath && other) languages[other] = absoluteUrl(twinPath);

  const imageUrl = image ? absoluteImage(image) : absoluteUrl(`/${lng}/opengraph-image`);

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description,
      url,
      locale: OG_LOCALE[lng],
      type,
      ...(publishedTime ? { publishedTime } : {}),
      images: [imageUrl],
    },
  };
}

export function personJsonLd(profile: PublicProfile, lng: Locale): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: absoluteUrl(`/${lng}/`),
    sameAs: profile.links.map((l) => l.url),
  };
}

export function blogPostingJsonLd(
  post: Pick<PublicPostDetail, "slug" | "title" | "summary" | "published_at">,
  lng: Locale,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    url: absoluteUrl(`/${lng}/posts/${post.slug}/`),
    datePublished: post.published_at,
  };
}
