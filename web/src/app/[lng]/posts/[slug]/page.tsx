import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

import { CoverImage } from "@/components/CoverImage";
import { renderMarkdown } from "@/components/Markdown/Markdown";
import { TagChip } from "@/components/TagChip";
import { getPost, getPosts, getTwinPaths } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { isLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/seo";
import { staticSlugParams } from "@/lib/static-params";

type Params = Promise<{ lng: string; slug: string }>;

// Only the slugs of the snapshot exist. A locale without posts returns [].
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { lng: string } }) {
  return staticSlugParams(params.lng, (l) => getPosts(l).map((p) => p.slug));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng, slug } = await params;
  if (!isLocale(lng)) notFound();
  const post = getPost(lng, slug);
  if (!post) notFound();
  const path = `/${lng}/posts/${slug}/`;
  return buildMetadata({
    lng,
    path,
    title: post.title,
    description: post.summary,
    image: post.cover_image?.url,
    type: "article",
    publishedTime: post.published_at,
    twinPath: getTwinPaths(lng)[path] ?? null,
  });
}

export default async function PostPage({ params }: { params: Params }) {
  const { lng, slug } = await params;
  if (!isLocale(lng)) notFound();
  const post = getPost(lng, slug);
  if (!post) notFound();
  const { t } = await getT("posts", { lng });
  const body = await renderMarkdown({
    source: post.body,
    copyLabel: t("markdown.copy"),
    copiedLabel: t("markdown.copied"),
  });

  return (
    <div className="bg-muted px-4 py-10 md:py-16">
      <article className="mx-auto w-full max-w-3xl rounded-3xl bg-card px-5 py-10 text-card-foreground md:px-12 md:py-14">
        <header className="flex flex-col items-center gap-4 text-center">
          <time dateTime={post.published_at} className="text-sm text-muted-foreground">
            {formatDate(post.published_at, lng)}
          </time>
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl" dir="auto">
            {post.title}
          </h1>
          <hr className="mt-2 w-48 border-0 border-t border-dashed border-muted-foreground/60" />
        </header>

        {post.cover_image ? (
          <div className="mt-8">
            <CoverImage image={post.cover_image} className="aspect-[1200/630]" />
          </div>
        ) : null}

        <div className="mt-8 font-serif">
          {body}
        </div>

        <footer className="mt-10 flex flex-col items-center gap-6">
          <hr className="w-48 border-0 border-t border-dashed border-muted-foreground/60" />
          {post.tags.length > 0 ? (
            <ul className="flex flex-wrap justify-center gap-2" aria-label={t("tags")}>
              {post.tags.map((tag) => (
                <li key={tag.slug}>
                  <TagChip lng={lng} tag={tag} />
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            href={`/${lng}/posts/`}
            className="inline-flex items-center gap-2 font-semibold underline underline-offset-4"
          >
            <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
            {t("back")}
          </Link>
        </footer>
      </article>
    </div>
  );
}
