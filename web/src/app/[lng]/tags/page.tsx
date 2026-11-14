import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

import { EmptyState } from "@/components/EmptyState";
import { Section } from "@/components/Section";
import { TagChip } from "@/components/TagChip";
import { getTags, getTwinPaths } from "@/lib/content";
import { isLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/seo";

type Params = Promise<{ lng: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("tags", { lng });
  return buildMetadata({
    lng,
    path: `/${lng}/tags/`,
    title: t("metaTitle"),
    description: t("metaDescription"),
    twinPath: getTwinPaths(lng)[`/${lng}/tags/`] ?? null,
  });
}

export default async function TagsPage({ params }: { params: Params }) {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("tags", { lng });
  const tags = getTags(lng);

  return (
    <Section>
      <h1 className="flex flex-wrap items-baseline justify-center gap-x-4 py-5 text-center text-4xl leading-tight tracking-tight md:text-5xl">
        <span className="font-normal">{t("titleLead")}</span>
        <span className="font-extrabold">{t("title")}</span>
      </h1>
      {tags.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <ul className="mt-5 flex flex-wrap justify-center gap-4">
          {tags.map((tag) => (
            <li key={tag.slug} className="flex items-center gap-2">
              <TagChip lng={lng} tag={tag} className="text-base" />
              <span className="text-sm text-muted-foreground">
                {t("count", { count: tag.postCount })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
