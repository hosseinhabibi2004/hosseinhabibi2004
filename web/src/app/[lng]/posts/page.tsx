import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { Section } from "@/components/Section";
import { getPosts, getTwinPaths } from "@/lib/content";
import { isLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/seo";

type Params = Promise<{ lng: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("posts", { lng });
  return buildMetadata({
    lng,
    path: `/${lng}/posts/`,
    title: t("metaTitle"),
    description: t("metaDescription"),
    twinPath: getTwinPaths(lng)[`/${lng}/posts/`] ?? null,
  });
}

export default async function PostsPage({ params }: { params: Params }) {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("posts", { lng });
  const posts = getPosts(lng);

  return (
    <Section>
      <h1 className="flex flex-wrap items-baseline justify-center gap-x-4 py-5 text-center text-4xl leading-tight tracking-tight md:text-5xl">
        <span className="font-normal">{t("titleStrong")}</span>
        <span className="font-extrabold">{t("title")}</span>
      </h1>
      {posts.length === 0 ? (
        <EmptyState title={t("empty")}>{t("emptyHint")}</EmptyState>
      ) : (
        <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} className="flex">
              <div className="flex w-full flex-col [&>article]:flex-1">
                <PostCard lng={lng} post={post} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
