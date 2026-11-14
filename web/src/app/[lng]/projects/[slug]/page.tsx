import { ArrowLeft, Code, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

import { CoverImage } from "@/components/CoverImage";
import { renderMarkdown } from "@/components/Markdown/Markdown";
import { Section } from "@/components/Section";
import { getProject, getProjects, getTwinPaths } from "@/lib/content";
import { isLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/seo";
import { staticSlugParams } from "@/lib/static-params";

type Params = Promise<{ lng: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { lng: string } }) {
  return staticSlugParams(params.lng, (l) => getProjects(l).map((p) => p.slug));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng, slug } = await params;
  if (!isLocale(lng)) notFound();
  const project = getProject(lng, slug);
  if (!project) notFound();
  const path = `/${lng}/projects/${slug}/`;
  return buildMetadata({
    lng,
    path,
    title: project.title,
    description: project.summary,
    image: project.cover_image?.url,
    twinPath: getTwinPaths(lng)[path] ?? null,
  });
}

const LINK_BUTTON =
  "inline-flex h-12 items-center gap-2 rounded-sm border-2 border-foreground px-4 font-semibold transition-colors hover:bg-foreground hover:text-background";

export default async function ProjectPage({ params }: { params: Params }) {
  const { lng, slug } = await params;
  if (!isLocale(lng)) notFound();
  const project = getProject(lng, slug);
  if (!project) notFound();
  const { t } = await getT("projects", { lng });
  const body = await renderMarkdown({
    source: project.body,
    copyLabel: t("markdown.copy"),
    copiedLabel: t("markdown.copied"),
  });

  return (
    <Section>
      <article className="mx-auto flex max-w-3xl flex-col gap-6">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl" dir="auto">
          {project.title}
        </h1>
        {project.cover_image ? (
          <div className="rounded-lg bg-muted p-4">
            <CoverImage image={project.cover_image} />
          </div>
        ) : null}
        <p className="text-lg text-muted-foreground" dir="auto">
          {project.summary}
        </p>
        {project.skills.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label={t("skills")}>
            {project.skills.map((skill) => (
              <li key={skill} className="rounded-sm bg-muted px-2.5 py-1 text-sm font-semibold">
                {skill}
              </li>
            ))}
          </ul>
        ) : null}
        {project.repo_url || project.live_url ? (
          <div className="flex flex-wrap gap-3">
            {project.repo_url ? (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className={LINK_BUTTON}>
                <Code aria-hidden className="size-5" />
                {t("repo")}
              </a>
            ) : null}
            {project.live_url ? (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={LINK_BUTTON}>
                <ExternalLink aria-hidden className="size-5" />
                {t("live")}
              </a>
            ) : null}
          </div>
        ) : null}
        <div className="mt-4">
          {body}
        </div>
        <Link
          href={`/${lng}/projects/`}
          className="mt-4 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
        >
          <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
          {t("back")}
        </Link>
      </article>
    </Section>
  );
}
