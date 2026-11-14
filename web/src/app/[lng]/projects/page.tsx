import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

import { EmptyState } from "@/components/EmptyState";
import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { getProjects, getTwinPaths } from "@/lib/content";
import { isLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/seo";

type Params = Promise<{ lng: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("projects", { lng });
  return buildMetadata({
    lng,
    path: `/${lng}/projects/`,
    title: t("metaTitle"),
    description: t("metaDescription"),
    twinPath: getTwinPaths(lng)[`/${lng}/projects/`] ?? null,
  });
}

export default async function ProjectsPage({ params }: { params: Params }) {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("projects", { lng });
  const projects = getProjects(lng);

  const heading = (
    <h1 className="flex flex-wrap items-baseline justify-center gap-x-4 py-5 text-center text-4xl leading-tight tracking-tight md:text-5xl">
      <span className="font-normal">{t("titleLead")}</span>
      <span className="font-extrabold">{t("title")}</span>
    </h1>
  );

  if (projects.length === 0) {
    return (
      <Section>
        {heading}
        <EmptyState title={t("empty")}>{t("emptyHint")}</EmptyState>
      </Section>
    );
  }

  return (
    <Section band>
      {/* Same band treatment as the home page: light-on-dark tokens in both themes. */}
      <div className="dark text-foreground">
        {heading}
        <div className="mt-5 flex flex-col gap-16 md:[&>article:nth-child(even)>*:first-child]:order-2">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} lng={lng} project={project} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
}
