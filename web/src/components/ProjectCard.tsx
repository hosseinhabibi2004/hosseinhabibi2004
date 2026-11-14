import { Code, ExternalLink } from "lucide-react";
import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import type { PublicProjectDetail } from "@/lib/content/types";
import { formatOrdinal, type Locale } from "@/lib/format";

type ProjectSummary = Pick<
  PublicProjectDetail,
  "slug" | "title" | "summary" | "repo_url" | "live_url" | "skills" | "cover_image"
>;

interface ProjectCardProps {
  lng: Locale;
  project: ProjectSummary;
  /** Zero-based position in the list; shown as a two-digit number. */
  index: number;
}

const LABELS: Record<Locale, { repo: string; live: string }> = {
  en: { repo: "Source code", live: "Live site" },
  fa: { repo: "کد منبع", live: "مشاهدهٔ سایت" },
};

const ICON_LINK =
  "inline-flex size-10 items-center justify-center rounded-sm border-2 border-foreground transition-colors hover:bg-foreground hover:text-background";

export function ProjectCard({ lng, project, index }: ProjectCardProps) {
  const labels = LABELS[lng];
  return (
    <article className="grid items-center gap-8 md:grid-cols-2">
      {project.cover_image ? (
        <div className="rounded-lg bg-muted p-4">
          <CoverImage image={project.cover_image} />
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        <p className="text-5xl font-extrabold leading-tight tracking-tight">
          {formatOrdinal(index + 1, lng)}
        </p>
        <h3 className="text-3xl font-semibold leading-tight" dir="auto">
          <Link href={`/${lng}/projects/${project.slug}/`}>{project.title}</Link>
        </h3>
        <p className="text-muted-foreground" dir="auto">
          {project.summary}
        </p>
        {project.skills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <li key={skill} className="rounded-sm bg-muted px-2.5 py-1 text-sm font-semibold">
                {skill}
              </li>
            ))}
          </ul>
        ) : null}
        {project.repo_url || project.live_url ? (
          <div className="flex gap-3">
            {project.repo_url ? (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={labels.repo}
                className={ICON_LINK}
              >
                <Code aria-hidden className="size-5" />
              </a>
            ) : null}
            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={labels.live}
                className={ICON_LINK}
              >
                <ExternalLink aria-hidden className="size-5" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
