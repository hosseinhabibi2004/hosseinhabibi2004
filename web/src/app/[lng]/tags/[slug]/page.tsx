import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

import { PostCard } from "@/components/PostCard";
import { Section } from "@/components/Section";
import { getPostsByTag, getTags, getTwinPaths } from "@/lib/content";
import { isLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/seo";
import { staticSlugParams } from "@/lib/static-params";

type Params = Promise<{ lng: string; slug: string }>;

// Only tags with a post in the locale exist.
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { lng: string } }) {
  return staticSlugParams(params.lng, (l) => getTags(l).map((t) => t.slug));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng, slug } = await params;
  if (!isLocale(lng)) notFound();
  const tag = getTags(lng).find((t) => t.slug === slug);
  if (!tag) notFound();
  const { t } = await getT("tags", { lng });
  const path = `/${lng}/tags/${slug}/`;
  return buildMetadata({
    lng,
    path,
    title: t("tagTitle", { name: tag.name }),
    description: t("tagDescription", { name: tag.name }),
    twinPath: getTwinPaths(lng)[path] ?? null,
  });
}

export default async function TagPage({ params }: { params: Params }) {
  const { lng, slug } = await params;
  if (!isLocale(lng)) notFound();
  const tag = getTags(lng).find((t) => t.slug === slug);
  if (!tag) notFound();
  const { t } = await getT("tags", { lng });
  const posts = getPostsByTag(lng, slug);

  return (
    <Section>
      <h1 className="py-5 text-center text-4xl font-extrabold leading-tight tracking-tight md:text-5xl" dir="auto">
        {tag.name}
      </h1>
      <p className="text-center text-muted-foreground">{t("count", { count: posts.length })}</p>
      <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug} className="flex">
            <div className="flex w-full flex-col [&>article]:flex-1">
              <PostCard lng={lng} post={post} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-center">
        <Link
          href={`/${lng}/tags/`}
          className="inline-flex items-center gap-2 font-semibold underline underline-offset-4"
        >
          <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
          {t("allTags")}
        </Link>
      </p>
    </Section>
  );
}
